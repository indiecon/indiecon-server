const Redis = require('ioredis');

// used custom host and port for redis because it has to run on a bare metal server along with the extension-server
const redis = new Redis();

module.exports = redis;
