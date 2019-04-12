
const charset = require('charset');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');

const HEAD_REG = /<head[\s\d\w="\\/-]*>/i;
const DOCTYPE_REG = /<!DOCTYPE/;

function injectAfterHead(data, inject) {
	if (!DOCTYPE_REG.test(data)) {
		data = '<!DOCTYPE html>\r\n' + data;
	}

	const matchResult = data.match(HEAD_REG);
	if (!matchResult) {
		return data;
	}

	const { index, input } = matchResult;
	const offset = index + matchResult[0].length;

	return input.substr(0, offset) + inject + input.substr(offset);
}

function bodyReplace(target, inject, headers) {
	const bodyCharset = charset(headers, target) || jschardet.detect(target).encoding.toLowerCase();
	const notUTF8 = bodyCharset !== null && bodyCharset !== 'utf-8';

	if (notUTF8) {
		const body = iconv.decode(target, bodyCharset);
		const newBody = injectAfterHead(body, inject);
		return iconv.encode(newBody, bodyCharset);
	} else {
		const body = target.toString();
		const newBody = injectAfterHead(body, inject);
		return new Buffer(newBody);
	}
}

module.exports = bodyReplace;