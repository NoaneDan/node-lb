'use strict';

const http = require('http');
const net = require('net');
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
    if (!server) {
        res.statusCode = 500;
        res.end();
        return;
    }

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

    setInterval(() => {
        for (const server of serverPool.pool) {
            const conn = net.createConnection(server.port, server.host, () => {
                if (!server.alive) {
                    console.log(`[+] ${server.host}:${server.port} came online`)
                    server.alive = true;
                }
            });

            conn.on('error', () => {
                if (server.alive) {
                    console.log(`[-] lost connection to ${server.host}:${server.port}`)
                    server.alive = false;
                }
            });
            conn.end();
        }
    }, 2000);
});

function proxyRequest(originReq, originRes, options, server, retryCount = 0) {
    if (retryCount >= 3) {
        server.alive = false;
        originRes.statusCode = 500;
        originRes.end();
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
