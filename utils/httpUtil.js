exports.isGzip = function (res) {
	const contentEncoding = res.headers['content-encoding'];
	return !!(contentEncoding && contentEncoding.toLowerCase() == 'gzip');
};
exports.isHtml = function (res) {
	const contentType = res.headers['content-type'];
	return (typeof contentType != 'undefined') && /text\/html|application\/xhtml\+xml/.test(contentType);
};