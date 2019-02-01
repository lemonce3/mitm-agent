exports.isGzipEncoding = function (res) {
	const contentEncoding = res.headers['content-encoding'];
	return !!(contentEncoding && contentEncoding.toLowerCase() == 'gzip');
};