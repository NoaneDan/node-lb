'use strict';

const http = require('http');

const server = http.createServer();

server.on('request', (req, res) => {
    console.log('[+] handling connection');

    const method = req.method;
    const url = req.url;
    const headers = req.headers;

    const options = {
        host: 'localhost',
        port: 8000,
        path: url,
        method,
        headers
    };

    const targetReq = http.request(options, (targetRes) => {
        targetRes.pipe(res);
    });
    req.pipe(targetReq);

    targetReq.on('error', (err) => {
        console.error(err);
    });
});

server.listen(5000, () => {
    console.log('[*] load balancer started');
});
