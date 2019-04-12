const fs = require('fs');

const script = fs.readFileSync('../../../gitee.com/shit-ie8-agent/dist/inject.js');
const scriptStr = `<script>\r\n${script}\r\n</script>`;

module.exports = {
	sslIntercept: true,
	forward: {
		rules: [
			{
				name: 'tracker',
				headerKey: 'lemonce-mitm',
				headerValue: 'forward-action-data',
				host: '127.0.0.1',
				port: 8888,
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
			host: 'localhost',
			port: 3000,
			apiPrefix: '/'
		}
	}
};