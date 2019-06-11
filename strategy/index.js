const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const replacement = require('./replacement');
const multitype = require('./multitype');

// const script = fs.readFileSync(path.resolve('bundle.js'));

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

module.exports = function StrategyFactory({ observer, tracker, enableIntercept }) {
	// const scriptStr = `<script>\r\nwindow.__OBSERVER_URL__='//${observer.hostname}:${observer.port}';${script}\r\n</script>`;
	const scriptStr = '';

	return {
		async sslConnect(clientRequest, socket, head) {
			return enableIntercept;
		},
		async request(context, respond, forward) {
			const { headers } = context.request;
			const contentType = headers['content-type'];
			// console.log(`正在访问：${options.protocol}//${options.hostname}:${options.port}`);

			if (contentType && contentType.includes('multipart')) {
				const mock = await multitype(context, {
					mockInfoField: '_lemonce_mock_',
					rescoureServer: Object.assign({}, observer, { apiMockFilePrefix: '/api/file' })
				});

				context.request.body = mock.body;
				context.request.options = mock.options;
			}

			if (context.request.url.pathname.includes('agent.html')) {
				context.request.protocol = observer.protocol;
				context.request.url.hostname = observer.hostname;
				context.request.url.port = observer.port;
				context.activeRule = 'fetch-agent';
			}

			if (context.request.headers['x-observer-forward'] === 'yes') {
				context.request.protocol = observer.protocol;
				context.request.url.hostname = observer.hostname;
				context.request.url.port = observer.port;
			}

			if (context.request.headers['x-tracker-forward'] === 'yes') {
				context.request.protocol = tracker.protocol;
				context.request.url.hostname = tracker.hostname;
				context.request.url.port = tracker.port;
			}

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
				bodyData = await new Promise((resolve, reject) => {
					zlib.gunzip(bodyData, (error, result) => {
						if (error) {
							reject(error);
						}

						resolve(result);
					});
				});
			}

			try {
				bodyData = await replacement(bodyData, scriptStr, headers);
				if (isGzip) {
					bodyData = await new Promise((resolve, reject) => {
						zlib.gzip(bodyData, (error, result) => {
							if (error) {
								reject(error);
							}

							resolve(result);
						});
					});
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
