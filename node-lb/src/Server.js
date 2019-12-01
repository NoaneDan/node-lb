'use strict';

class Server {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.alive = true;
    }
}

module.exports = Server;