const mitm = require('@lemonce3/mitm');
const StrategyFactory = require('./strategy');

module.exports = function createMitm(server, options) {
	const { observer, resourceServer, ssl, certificateStore } = options;
	const { rootCA, sslIntercept } = ssl;
	const strategy = StrategyFactory({ observer, sslIntercept });
	
	return mitm.Server.create(strategy, { server, ssl: rootCA, certificateStore });
};