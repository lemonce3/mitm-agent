const fs = require('fs');
const mitm = require('@lemonce3/mitm');
const InterceptorFactory = require('./interceptor');

const script = fs.readFileSync('../../../gitee.com/shit-ie8-agent/dist/inject.js');
const scriptStr = `<script>\r\n${script}\r\n</script>`;

module.exports = function StrategyFactory(options) {
	const { protocol, hostname, port } = new URL(options.observer);

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
							return true;
						}

						return false;
					},
					handler(requestOptions, body) {
						requestOptions.protocol = this.protocol;
						requestOptions.host = this.host;
						requestOptions.port = this.port;
					}
				}
			]
		},
		bodyReplace: {
			inject: scriptStr
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