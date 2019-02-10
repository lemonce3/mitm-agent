function cloneResHeaders (proxyRes, res, isHtml) {
	Object.keys(proxyRes.headers).forEach(function (key) {
		if (proxyRes.headers[key] != undefined) {
			var newkey = key.replace(/^[a-z]|-[a-z]/g, (match) => {
				return match.toUpperCase();
			});

			if (isHtml && key === 'content-length') {
				// do nothing
			} else {
				res.setHeader(newkey, proxyRes.headers[key]);
			}
		}
	});
}

module.exports = cloneResHeaders;