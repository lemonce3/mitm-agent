
var charset = require('charset');
var iconv = require('iconv-lite');
var jschardet = require('jschardet');
const _ = require('lodash');

const HEAD_REG = /(<head[\s\d\w="\\/-]*>)/i;

function injectAfterHead(data, inject) {
	const matchResult = data.match(HEAD_REG);
	if (!matchResult) {
		return data;
	}
	const afterInject = data.slice(matchResult.index + matchResult[0].length);
	const beforeInject = data.split(afterInject)[0];
	const rewrited = beforeInject + inject + afterInject;
	// const rewrited = _.replace(data, HEAD_REG, '$1' + inject);

	return rewrited;
}

function chunkReplace (_this, chunk, enc, callback, inject, proxyRes) {
	const _charset = charset(proxyRes, chunk) || jschardet.detect(chunk).encoding.toLowerCase();
	let chunkString;
	if (_charset != null && _charset != 'utf-8') {
		chunkString = iconv.decode(chunk, _charset);
	} else {
		chunkString = chunk.toString();
	}

	const newChunkString = injectAfterHead(chunkString, inject);

	let buffer;
	if (_charset != null && _charset != 'utf-8') {
		buffer = iconv.encode(newChunkString, _charset);
	} else {
		buffer = new Buffer(newChunkString);
	}

	_this.push(buffer);
	callback();
}

module.exports = chunkReplace;