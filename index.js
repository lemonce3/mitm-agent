const fs = require('fs');
const path = require('path');
const mitm = require('@lemonce3/mitm');
const http = require('http');
const crypto = require('crypto');
const config = require('./config.js');

const interceptorFactory = require('./interceptor');

function getSHA1(content) {
	const hash = crypto.createHash('sha1');

	hash.update(content);

	return hash.digest('hex');
}

const logHandler = log => console.log(log);
const rootCA = require('./dev-cert.json');
const hash = getSHA1(rootCA.cert);
const certPath = path.resolve('cert', hash);
const certData = {};
fs.mkdirSync(certPath, { recursive: true });
fs.readdirSync(certPath).forEach(filename => {
	certData[filename.slice(0, -5)] = require(path.join(certPath, filename));
});

const certificateStore = new mitm.CertificateStore(rootCA.cert, rootCA.key, certData);

certificateStore.on('signed', ({ hostname, newCertKeyPair }) => {
	fs.writeFile(path.join(certPath, `${hostname}.json`), JSON.stringify(newCertKeyPair), () => {});
});

const interceptor = interceptorFactory(config);

const strategy = mitm.Strategy.create(interceptor);

const mitmServer = http.createServer();

mitm.Server.create(strategy, {
	ssl: rootCA,
	server: mitmServer,
	certificateStore,
	// log: logHandler
});

mitmServer.listen(6788);