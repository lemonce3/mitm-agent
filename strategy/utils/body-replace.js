
const charset = require('charset');
const iconv = require('iconv-lite');
const htmlparser2 = require('htmlparser2');
const jschardet = require('jschardet');

const HEAD_REG = /<head[\s\d\w="\\/-]*>/i;

function isHTML(data) {
	const endSignal = new Error();
	return new Promise((resolve, reject) => {
		const parser = new htmlparser2.Parser({
			onopentag() {
				resolve(true);
				throw endSignal;
			},
			ontext(text) {
				if (text.trim().length > 0) {
					resolve(false);
					throw endSignal;
				}
			},
			onerror(error) {
				if (error !== endSignal) {
					reject(error);
				}
			},
			onend() {
				resolve(false);
			}
		});

		parser.write(data);
		parser.end();
	});
}

async function injectAfterHead(data, inject) {
	if (!await isHTML(data)) {
		return;
	}

	const matchResult = data.match(HEAD_REG);
	if (!matchResult) {
		return data;
	}

	const { index, input } = matchResult;
	const offset = index + matchResult[0].length;

	return input.substr(0, offset) + inject + input.substr(offset);
}

async function bodyReplace(target, injection, headers) {
	const bodyCharset = charset(headers, target) || jschardet.detect(target).encoding.toLowerCase();
	const notUTF8 = bodyCharset !== null && bodyCharset !== 'utf-8';

	if (notUTF8) {
		const body = iconv.decode(target, bodyCharset);
		const newBody = await injectAfterHead(body, injection);
		return iconv.encode(newBody, bodyCharset);
	} else {
		const body = target.toString();
		const newBody = await injectAfterHead(body, injection);
		return new Buffer(newBody);
	}
}

module.exports = bodyReplace;