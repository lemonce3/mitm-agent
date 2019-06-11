const mitm = require('@lemonce3/mitm');
const StrategyFactory = require('./strategy');

module.exports = function createMitm(server, options) {
	const { observer, tracker, ssl, certificateStore, log } = options;
	const { rootCA, enableIntercept } = ssl;
	const strategy = StrategyFactory({ observer: new URL(observer), tracker: new URL(tracker), enableIntercept });
	
	return mitm.Server.create(mitm.Strategy.create(strategy), { server, ssl: rootCA, certificateStore, log });
};