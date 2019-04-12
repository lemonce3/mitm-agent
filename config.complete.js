const fs = require('fs');

const script = fs.readFileSync('../../../gitee.com/shit-ie8-agent/dist/inject.js');
const scriptStr = `<script>\r\n${script}\r\n</script>`;

module.exports = {
	sslIntercept: true,
	forward: {
		rules: [
			{
				name: 'observer',
				host: '127.0.0.1',
				port: 8080,
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
			protocol: 'http:',
			host: 'localhost',
			port: 3000,
			apiPrefix: '/'
		}
	}
};