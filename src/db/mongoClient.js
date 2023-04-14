const { set, connect, connection } = require('mongoose');

const { config } = require('../config/config');

set('strictQuery', true);
connect(config.db.uri);
const db = connection;

module.exports = { db };
