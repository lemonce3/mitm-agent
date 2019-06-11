const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CertificateStore } = require('@lemonce3/mitm');
const rootCA = require('./dev-cert.json');

//certStore
function getSHA1(content) {
	const hash = crypto.createHash('sha1');

	hash.update(content);

	return hash.digest('hex');
}

const hash = getSHA1(rootCA.cert);
const certPath = path.resolve('cert', hash);
const certData = {};
fs.mkdirSync(certPath, { recursive: true });
fs.readdirSync(certPath).forEach(filename => {
	certData[filename.slice(0, -5)] = require(path.join(certPath, filename));
});

const certificateStore = new CertificateStore(rootCA.cert, rootCA.key, certData);

certificateStore.on('signed', ({ hostname, newCertKeyPair }) => {
	fs.writeFile(path.join(certPath, `${hostname}.json`), JSON.stringify(newCertKeyPair), () => { });
});

//log
const logHandler = log => console.log(log);

module.exports = {
	observer: 'http://localhost:8080',
	tracker: 'http://localhost:8080',
	ssl: {
		rootCA,
		enableIntercept: true
	},
	certificateStore
};