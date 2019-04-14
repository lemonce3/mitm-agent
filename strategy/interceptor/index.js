const zlib = require('zlib');

const bodyReplace = require('./body-replace');
const multitypeMock = require('./multitype-mock');

const httpUtil = {
	isHtml(headers) {
		const contentType = headers['content-type'];
		return (typeof contentType != 'undefined') && /text\/html|application\/xhtml\+xml/.test(contentType);//TODO: jsonp
	},
	isGzip(headers) {
		const contentEncoding = headers['content-encoding'];
		return contentEncoding ? contentEncoding.toLowerCase() === 'gzip' : false;
	}
};

function getReadableData(readableStream) {
	return new Promise((resolve, reject) => {
		let result = Buffer.from([]);

		readableStream.on('error', error => reject(error));
		readableStream.on('data', data => result = Buffer.concat([result, data], result.length + data.length));
		readableStream.on('end', () => resolve(result));
	});
}

module.exports = function InterceptorFactory(interceptorOptions) {
	return {
		sslConnect: async function (clientRequest, socket, head) {
			return interceptorOptions.sslIntercept;
		},
		request: async function (ctx, respond, forward) {
			const options = ctx.request.options;
			delete options.headers['accept-encoding'];
			const contentType = options.headers['content-type'];
			// console.log(`正在访问：${options.protocol}//${options.hostname}:${options.port}`);

			if (interceptorOptions.multitypeMock && contentType && contentType.includes('multipart')) {
				const mock = await multitypeMock(ctx, interceptorOptions.multitypeMock);
				ctx.request = mock;
			}

			const forwardRules = interceptorOptions.forward.rules;

			if (forwardRules) {
				const activeRule = forwardRules.find(rule => rule.check(ctx));
	
				if (activeRule) {
					activeRule.handler(options, ctx.request.body);
				}
			}

			forward();
		},
		response: async function (ctx, respond) {
			const { headers, body } = ctx.response;
			const isHtml = httpUtil.isHtml(headers);

			if (!isHtml) {
				respond();
			} else {
				const isGzip = httpUtil.isGzip(headers);

				let bodyData = await getReadableData(body);

				if (isGzip) {
					bodyData = zlib.gunzip(bodyData);
				} else {
					//do nothing
				}

				bodyData = bodyReplace(bodyData, interceptorOptions.bodyReplace.inject, headers);

				if (isGzip) {
					bodyData = zlib.gzip(bodyData);
				} else {
					//do nothing
				}

				ctx.response.body = bodyData;
				respond();
			}
		}
	};
};
