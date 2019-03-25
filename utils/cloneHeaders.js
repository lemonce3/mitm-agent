function cloneHeaders (origin, target, isHtml) {
	Object.keys(origin.headers).forEach(function (key) {
		if (origin.headers[key] != undefined) {
			var newkey = key.replace(/^[a-z]|-[a-z]/g, (match) => {
				return match.toUpperCase();
			});

			if (isHtml && key === 'content-length') {
				// do nothing
			} else {
				target.setHeader(newkey, origin.headers[key]);
			}
		}
	});
}

module.exports = cloneHeaders;