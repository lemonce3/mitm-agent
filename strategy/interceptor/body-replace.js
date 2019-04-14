
const charset = require('charset');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');

async function bodyReplace(target, inject, headers) {
	const bodyCharset = charset(headers, target) || jschardet.detect(target).encoding.toLowerCase();
	const notUTF8 = bodyCharset !== null && bodyCharset !== 'utf-8';

	if (notUTF8) {
		const body = iconv.decode(target, bodyCharset);
		const newBody = await inject(body);
		return iconv.encode(newBody, bodyCharset);
	} else {
		const body = target.toString();
		const newBody = await inject(body);
		return new Buffer(newBody);
	}
}

module.exports = bodyReplace;