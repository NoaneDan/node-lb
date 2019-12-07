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
        let index = 0;
        while (!this.pool[this.current % this.pool.length].alive && index < this.pool.length) {
            ++this.current;
            ++index;
        }

        // no alive server found
        if (index === this.pool.length) {
            return null;
        }

        return this.pool[this.current++ % this.pool.length];
    }
}

module.exports = ServerPool;