const fs = require('fs');

const trackerServer = {
	host: '192.168.137.113',
	port: 8888
};

const resourceServer = {
	host: 'localhost',
	port: 3000,
	apiPrefix: '/'
};

const script = fs.readFileSync('../../../gitee.com/shit-ie8-agent/dist/inject.js');
const injection = `<script>\r\n${script}\r\n</script>`;

// const injection = `<script src="http://${forwardServer.host}:${forwardServer.port}/inject.js"></script>`;

module.exports = {
	trackerServer,
	resourceServer,
	injection
};