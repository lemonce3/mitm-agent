const through = require('through2');
const zlib = require('zlib');
const mitm = require('mitm');
const path = require('path');
const cwd = process.cwd();
const {httpUtil, chunkReplace, forwardIfHaveFlagHeader, cloneResHeaders } = require('../utils');
const { forwardServer, injection } = require(path.resolve(cwd, 'config.js'));

const options = {
	sslConnectInterceptor: (req, cltSocket, head) => {
		return true;
	},
	requestInterceptor: (rOptions, req, res, ssl, next) => {
		console.log(`正在访问：${rOptions.protocol}//${rOptions.hostname}:${rOptions.port}`);

		const flagHeaders = {
			'lemonce-mitm': 'forward-action-data'
		};

		forwardIfHaveFlagHeader(rOptions, flagHeaders, forwardServer.host, forwardServer.port, req, res)(next);
	},
	responseInterceptor: (req, res, proxyReq, proxyRes, ssl, next) => {
		const isHtml = httpUtil.isHtml(proxyRes);
		const contentLengthIsZero = (() => {
			return proxyRes.headers['content-length'] == 0;
		})();
		if (!isHtml || contentLengthIsZero) {
			next();
		} else {
			cloneResHeaders(proxyRes, res, isHtml);

			res.writeHead(proxyRes.statusCode);

			const isGzip = httpUtil.isGzip(proxyRes);

			if (isGzip) {
				proxyRes.pipe(new zlib.Gunzip())
					.pipe(through(function (chunk, enc, callback) {
						chunkReplace(this, chunk, enc, callback, injection, proxyRes);
					})).pipe(new zlib.Gzip()).pipe(res);
			} else {
				proxyRes.pipe(through(function (chunk, enc, callback) {
					chunkReplace(this, chunk, enc, callback, injection, proxyRes);
				})).pipe(res);
			}
		}
		next();
	}
};

mitm.createProxy(options);
