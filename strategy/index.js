const fs = require('fs');
const mitm = require('@lemonce3/mitm');
const htmlparser2 = require('htmlparser2');
const InterceptorFactory = require('./interceptor');

const HEAD_REG = /<head[\s\d\w="\\/-]*>/i;

function isHTML(data) {
	const endSignal = new Error();
	return new Promise((resolve, reject) => {
		const parser = new htmlparser2.Parser({
			onopentag() {
				resolve(true);
				throw endSignal;
			},
			ontext(text) {
				if (text.trim().length > 0) {
					resolve(false);
					throw endSignal;
				}
			},
			onerror(error) {
				if (error !== endSignal) {
					reject(error);
				}
			},
			onend() {
				resolve(false);
			}
		});

		parser.write(data);
		parser.end();
	});
}


module.exports = function StrategyFactory(options) {
	async function injectAfterHead(data) {
		if (!await isHTML(data)) {
			return;
		}
	
		const matchResult = data.match(HEAD_REG);
		if (!matchResult) {
			return data;
		}
	
		const { index, input } = matchResult;
		const offset = index + matchResult[0].length;
	
		return input.substr(0, offset) + scriptStr + input.substr(offset);
	}

	const { protocol, hostname, port } = new URL(options.observer);
	const script = fs.readFileSync('./bundle.js');
	const scriptStr = `<script>\r\nwindow.__OBSERVER_URL__='//${hostname}:${port}';${script}\r\n</script>`;

	const interceptorOptions = {
		sslIntercept: true,
		forward: {
			rules: [
				{
					name: 'observer',
					protocol,
					host: hostname,
					port: port,
					check(ctx) {
						const headerKey = 'x-observer-forward';
						const headerValue = 'yes';

						if (ctx.request.options.headers[headerKey] === headerValue) {
							return true;
						}

						if (ctx.request.options.path.includes('agent.html')) {
							ctx.activeRule = 1;
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
			]
		},
		bodyReplace: {
			inject: injectAfterHead
		},
		multitypeMock: {
			mockInfoField: '_lemonce_mock_',
			resourceServer: {
				protocol,
				host: hostname,
				port
			}
		}
	};

	const interceptor = InterceptorFactory(interceptorOptions);

	return mitm.Strategy.create(interceptor);
};