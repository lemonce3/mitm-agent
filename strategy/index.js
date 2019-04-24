const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const bodyReplace = require('./utils/body-replace');
const multitypeMock = require('./utils/multitype-mock');

const script = fs.readFileSync(path.resolve('bundle.js'));

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

module.exports = function StrategyFactory({ observer, enableIntercept }) {
	const scriptStr = `<script>\r\nwindow.__OBSERVER_URL__='//${observer.hostname}:${observer.port}';${script}\r\n</script>`;

	return {
		async sslConnect(clientRequest, socket, head) {
			return enableIntercept;
		},
		async request(context, respond, forward) {
			const { headers } = context.request;
			const contentType = headers['content-type'];
			// console.log(`正在访问：${options.protocol}//${options.hostname}:${options.port}`);

			if (contentType && contentType.includes('multipart')) {
				const mock = await multitypeMock(context, {
					mockInfoField: '_lemonce_mock_',
					rescoureServer: Object.assign({}, observer, { apiMockFilePrefix: '/api/file' })
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

						if (context.request.headers[headerKey] === headerValue) {
							return true;
						}

						return false;
					},
					handler(context) {
						context.request.protocol = this.protocol;
						context.request.url.hostname = this.host;
						context.request.url.port = this.port;
					}
				},
				{
					name: 'tracker-forward',
					protocol: 'http:',
					host: 'localhost',
					port: 8888,
					test(context) {
						const headerKey = 'lemonce-mitm';
						const headerValue = 'forward-action-data';

						if (context.request.headers[headerKey] === headerValue) {
							return true;
						}

						return false;
					},
					handler(context) {
						context.request.headers['client-address'] = 'localhost';
						context.request.headers['user-agent'] = 'aeou';
						context.request.protocol = this.protocol;
						context.request.url.hostname = this.host;
						context.request.url.port = this.port;
					}
				},
				{
					name: 'fetch-agent',
					protocol: observer.protocol,
					host: observer.hostname,
					port: observer.port,
					test(context) {
						if (context.request.url.pathname.includes('agent.html')) {
							context.activeRule = this.name;
							return true;
						}

						return false;
					},
					handler(context) {
						context.request.url.protocol = this.protocol;
						context.request.url.hostname = this.host;
						context.request.url.port = this.port;
					}
				}
			];

			forwardRules.forEach(rule => {
				if (rule.test(context)) {
					rule.handler(context);
				}
			});

			forward();
		},
		async response(context, respond) {
			const { headers, statusCode } = context.response;
			
			if (statusCode >= 300 && statusCode < 400) {
				return respond();
			}
			
			if (!httpUtil.isHtmlHeader(headers)) {
				return respond();
			}
			
			if (context.activeRule === 'fetch-agent') {
				return respond();
			}
			
			const isGzip = httpUtil.isGzip(headers);
			
			// return respond();
			let bodyData = await getReadableData(context.response.body);
			

			if (isGzip) {
				bodyData = zlib.gunzip(bodyData);
			}

			try {
				bodyData = await bodyReplace(bodyData, scriptStr, headers);
				// const a = Buffer.from('');
				// bodyData = Buffer.concat([bodyData, a], bodyData.length + a.length);
				if (isGzip) {
					bodyData = zlib.gzip(bodyData);
				}

				context.response.body = bodyData;
			} catch (error) {
				context.response.statusCode = 418;
				context.response.headers['content-type'] = 'text/plain';
				context.response.body = 'I could not understand your document. :(  --by man in teapot middle';
			}

			respond();
		}
	};
};
