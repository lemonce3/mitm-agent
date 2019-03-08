const zlib = require('zlib');
const mitm = require('mitm');
const path = require('path');
const cwd = process.cwd();
const {httpUtil, chunkReplace, forwardIfHaveFlagHeader, cloneResHeaders } = require('../utils');
const { forwardServer, injection } = require(path.resolve(cwd, 'config.js'));

const options = {
	sslConnectInterceptor: (req, clientSocket, head) => {
		return true;
	},
	requestInterceptor: (rOptions, req, res, ssl, next) => {
		// console.log(`正在访问：${rOptions.protocol}//${rOptions.hostname}:${rOptions.port}`);

		const flagHeaders = {
			'lemonce-mitm': 'forward-action-data'
		};

		delete rOptions.headers['accept-encoding'];

		forwardIfHaveFlagHeader(rOptions, flagHeaders, forwardServer.host, forwardServer.port, req, res)(next);
	},
	responseInterceptor: (req, res, proxyReq, proxyRes, ssl, next) => {
		const isHtml = httpUtil.isHtml(proxyRes);
		if (!isHtml) {
			next();
		} else {
			cloneResHeaders(proxyRes, res, isHtml);
			res.writeHead(proxyRes.statusCode);

			const isGzip = httpUtil.isGzip(proxyRes);

			let chunk = Buffer.from([]);

			proxyRes.on('data', data => {
				chunk = Buffer.concat([chunk, data], chunk.length + data.length);
			});

			proxyRes.on('end', (e) => {
				if (isGzip) {
					chunk = zlib.gunzip(chunk);
				} else {
					//do nothing
				}
	
				chunk = chunkReplace(chunk, injection, proxyRes);

				if (isGzip) {
					chunk = zlib.gzip(chunk);
				} else {
					//do nothing
				}

				res.end(chunk);
			});
		}
		next();
	}
};

process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
});

mitm.createProxy(options);