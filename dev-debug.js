const http = require('http');
const createMitm = require('.');
const config = require('./config');

const server = http.createServer();

createMitm(server, config);

server.listen(6788);