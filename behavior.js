const zlib = require('zlib');
const mitm = require('mitm');
const path = require('path');

const { httpUtil, chunkReplace, forward, cloneHeaders, multitypeMock } = require('./utils');
const { trackerServer, injection } = require(path.resolve('config.js'));

const options = {
	sslConnectInterceptor: (clientRequest, clientSocket, head) => {
		return false;
	},
	requestInterceptor: async function (clientRequestOptions, clientRequest, clientResponse, ssl, next) {
		// console.log(`正在访问：${rOptions.protocol}//${rOptions.hostname}:${rOptions.port}`);
		const contentType = clientRequestOptions.headers['content-type'];
		if (contentType && contentType.includes('multipart')) {
			await multitypeMock(clientRequestOptions, clientRequest, clientResponse);
			return;
		} else {
			//do nothing
			next();
		}
		const forwardRules = [
			{
				headerKey: 'lemonce-mitm',
				headerValue: 'forward-action-data',
				host: trackerServer.host,
				port: trackerServer.port
			}
		];

		delete clientRequestOptions.headers['accept-encoding'];

		forwardRules.find(rule => clientRequestOptions.headers[rule.headerKey] === rule.headerValue
			? forward(clientRequestOptions, rule.host, rule.port, clientRequest, clientResponse)
			: next()
		);
	},
	responseInterceptor: (req, res, proxyReq, proxyRes, ssl, next) => {
		const isHtml = httpUtil.isHtml(proxyRes);
		if (!isHtml) {
			next();
		} else {
			cloneHeaders(proxyRes, res, isHtml);
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

// process.on('uncaughtException', function (err) {
// 	console.log('Caught exception: ' + err);
// });

mitm.createProxy(options);