const mitm = require('@lemonce3/mitm');
const StrategyFactory = require('./strategy');

module.exports = function createMitm(server, options) {
	const { observer, resourceServer, ssl, certificateStore } = options;
	const strategy = StrategyFactory({ observer, resourceServer });
	
	return mitm.Server.create(strategy, { server, ssl, certificateStore });
};