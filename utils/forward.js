const http = require('http');
const cloneHeaders = require('./cloneHeaders.js');

function forward(reqOptions, hostname, port, req, res) {
	const clientAddress = req.connection.remoteAddress;
	const clientPort = req.connection.remotePort;

	reqOptions.hostname = hostname;
	reqOptions.port = port;

	const forwardReq = http.request(reqOptions, forwardRes => {
		cloneHeaders(forwardRes, res, false);
		res.writeHead(forwardRes.statusCode);
		forwardRes.pipe(res);
	});
	
	forwardReq.setHeader('client-address', clientAddress);
	forwardReq.setHeader('client-port', clientPort);
	req.pipe(forwardReq);

	forwardReq.on('error', e => {
		console.log(e);
	});
	
	req.on('error', e => {
		console.log(e);
	});
}

module.exports = forward;