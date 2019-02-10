const http = require('http');
const cloneResHeaders = require('./cloneResHeaders.js');

function forwardIfHasFlagHeader(reqOptions, flagHeaders, hostname, port, req, res) {

	const shouldNotForward = Object.keys(flagHeaders).some(key => {
		return reqOptions.headers[key] !== flagHeaders[key];
	});

	if (shouldNotForward) {
		return callback => callback();
	} else {
		reqOptions.hostname = hostname;
		reqOptions.port = port;
		const forwardReq = http.request(reqOptions, forwardRes => {
			cloneResHeaders(forwardRes, res, false);
			res.writeHead(forwardRes.statusCode);
			forwardRes.pipe(res);
		});
		req.pipe(forwardReq);

		forwardReq.on('error', e => {
			console.log(e);
		});
		
		req.on('error', e => {
			console.log(e);
		});
		return () => { };
	}
}

module.exports = forwardIfHasFlagHeader;