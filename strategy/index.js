const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const bodyReplace = require('./utils/body-replace');
const multitypeMock = require('./utils/multitype-mock');

const script = fs.readFileSync(path.resolve('inject.js'));
const scriptStr = `<script>\r\n${script}\r\n</script>`;

const httpUtil = {
	isHtmlHeader(headers) {
		const contentType = headers['content-type'];
		return (typeof contentType != 'undefined') && /text\/html|application\/xhtml\+xml/.test(contentType);
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

module.exports = function InterceptorFactory(options) {
	const { observer } = options;
	return {
		async sslConnect(clientRequest, socket, head) {
			return options.sslIntercept;
		},
		async request(context, respond, forward) {
			const options = context.request.options;
			delete options.headers['accept-encoding'];
			const contentType = options.headers['content-type'];
			// console.log(`正在访问：${options.protocol}//${options.hostname}:${options.port}`);

			if (contentType && contentType.includes('multipart')) {
				const mock = await multitypeMock(context, {
					mockInfoField: '_lemonce_mock_',
					observerOptions: observer
				});

				context.request.body = mock.body;
				context.request.options = mock.options;
			}

			const forwardRules = [
				{
					name: 'observer-forward',
					protocol: observer.protocol,
					host: observer.hostname,
					port: observer.port,
					test(context) {
						const headerKey = 'x-observer-forward';
						const headerValue = 'yes';

						if (context.request.options.headers[headerKey] === headerValue) {
							return true;
						}

						return false;
					},
					handler(requestOptions, body) {
						requestOptions.protocol = this.protocol;
						requestOptions.host = this.host;
						requestOptions.port = this.port;
					}
				},
				{
					name: 'fetch-agent',
					protocol: observer.protocol,
					host: observer.hostname,
					port: observer.port,
					test(context) {
						if (context.request.options.path.includes('agent.html')) {
							context.activeRule = this.name;
							return true;
						}

						return false;
					},
					handler(ctx) {
						ctx.request.options.protocol = this.protocol;
						ctx.request.options.host = this.host;
						ctx.request.options.port = this.port;
					}
				}
			];

			forwardRules.forEach(rule => {
				if (rule.test(context)) {
					rule.handler(options, context.request.body);
				}
			});

			forward();
		},
		async response(context, respond) {
			const { headers } = context.response;

			if (!httpUtil.isHtmlHeader(headers)) {
				return respond();
			}

			if (context.activeRule === 'fetch-agent') {
				return respond();
			}

			const isGzip = httpUtil.isGzip(headers);

			let bodyData = await getReadableData(context.responseBody);

			if (isGzip) {
				bodyData = zlib.gunzip(bodyData);
			}

			try {
				bodyData = await bodyReplace(bodyData, scriptStr, headers);

				if (isGzip) {
					bodyData = zlib.gzip(bodyData);
				}

				context.response.body = bodyData;
			} catch (error) {
				context.setResponse({
					statusCode: 418,
					body: 'I could not understand your document. :(  --by man in teapot middle',
					headers(origin) {
						origin['content-type'] = 'text/plain';
						return origin;
					}
				});
			}

			respond();
		}
	};
};
