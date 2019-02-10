const mitm = require('./src');
const LRU = require('lru-cache');
const iconv = require('iconv-lite');
const utils = require('./src/common/util');
const pako = require('pako');

const cache = new LRU({
	maxAge: 3600000,
	max: 1000000000,
	length(n) {
		return n.length;
	}
});

const HTML_REG = /html/;
const CHARSET_REG = /charset\s*=\s*([\w\d-]+)/i;
const HEAD_REG = /(<head[\s\d\w="\\/-]*>)/i;
const INJECTION = '<script type="text/javascript">console.log(1234)</script>';

function rewriteHtmlData(data) {
	const rewrited = data.replace(HEAD_REG, '$1' + INJECTION);

	return rewrited;
}
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const config = {
	sslConnectInterceptor: (req, cltSocket, head) => {
		return true;
	},
	requestInterceptor: (rOptions, req, res, ssl, next) => {
		console.log(`正在访问：${rOptions.protocol}//${rOptions.hostname}:${rOptions.port}`);

		// console.log('cookie:', rOptions.headers.cookie);
		// res.end('hello node-mitmproxy!');
		// return;
		next();
	},
	responseInterceptor: (req, res, proxyReq, proxyRes, ssl, next) => {
		const conentType = proxyRes.headers['content-type'];

		if (!HTML_REG.test(conentType)) {
			next();
			return;
		}

		let resBody = Buffer.from([]);;

		proxyRes.on('data', data => {
			resBody = Buffer.concat([resBody, data]);
		});

		proxyRes.on('end', () => {
			const { statusCode, statusMessage } = proxyRes;
			res.removeHeader('content-encoding');
			res.removeHeader('content-length');
			res.setHeader('hhh', 'hhhhh');

			const isGzip = utils.isGzipEncoding(proxyRes);

			if (isGzip) {
				resBody = Buffer.from(pako.ungzip(resBody).buffer);
			}

			const matched = conentType.match(CHARSET_REG);

			let exactCharset = matched && matched[1];

			if (!exactCharset) {
				const headMatched = resBody.toString().match(CHARSET_REG);

				exactCharset = headMatched && headMatched[1];
			}

			const charset = exactCharset ? exactCharset : 'gbk';
			const decoded = iconv.decode(resBody, charset);

			const newBody = rewriteHtmlData(decoded);

			const resolved = iconv.encode(newBody, charset);

			res.write(resolved);
			next();
		});
	}
}

mitm.createProxy(config);