'use strict';

const http = require('http');
const Server = require('./src/Server');
const ServerPool = require('./src/ServerPool');

const server1 = new Server('localhost', 8000);
const server2 = new Server('localhost', 8001);
const server3 = new Server('localhost', 8002);
const serverPool = new ServerPool();
serverPool.addServer(server1);
serverPool.addServer(server2);
serverPool.addServer(server3);

const server = http.createServer();

server.on('request', (req, res) => {
    console.log('[+] handling connection');

    const method = req.method;
    const url = req.url;
    const headers = req.headers;

    const server = serverPool.getServer();

    const options = {
        host: server.host,
        port: server.port,
        path: url,
        method,
        headers
    };

    proxyRequest(req, res, options, server);
});

server.listen(5000, () => {
    console.log('[*] load balancer started');
});

function proxyRequest(originReq, originRes, options, server, retryCount = 0) {
    if (retryCount >= 5) {
        server.alive = false;
        originRes.end(500);
        return;
    }

    const req = http.request(options, (res) => {
        res.pipe(originRes);
    });
    originReq.pipe(req);

    req.on('error', () => {
        proxyRequest(originReq, originRes, options, server, ++retryCount);
    });
}
