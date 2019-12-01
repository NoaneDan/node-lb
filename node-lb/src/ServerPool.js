'use strict';

class ServerPool {
    constructor() {
        this.pool = [];
        this.current = 0;
    }

    addServer(server) {
        this.pool.push(server);
    }

    getServer() {
        while (!this.pool[this.current % this.pool.length].alive) {
            ++this.current;
        }
        return this.pool[this.current++ % this.pool.length];
    }
}

module.exports = ServerPool;