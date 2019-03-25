const http = require('http');
const formidable = require('formidable');
const formData = require('form-data');
const StringDecoder = require('string_decoder').StringDecoder;
const cloneHeaders = require('./cloneHeaders.js');
const { resourceServer } = require('../config');

const IncomingForm = formidable.IncomingForm;

IncomingForm.prototype.handlePart = function handlePart(part) {
	const self = this;
	// This MUST check exactly for undefined. You can not change it to !part.filename.
	if (part.filename === undefined) {
		let value = ''
			, decoder = new StringDecoder(this.encoding);

		part.on('data', function (buffer) {
			self._fieldsSize += buffer.length;
			if (self._fieldsSize > self.maxFieldsSize) {
				self._error(new Error('maxFieldsSize exceeded, received ' + self._fieldsSize + ' bytes of field data'));
				return;
			}
			value += decoder.write(buffer);
		});

		part.on('end', function () {
			self.emit('field', part.name, value);
		});
		return;
	}

	const file = {
		name: part.name,
		filename: part.filename,
		type: part.mime,
		length: 0,
		buffer: Buffer.from([])
	};
	self.files.push(file);

	part.on('data', function (buffer) {
		file.length += buffer.length;
		self._fileSize += buffer.length;
		if (self._fileSize > self.maxFileSize) {
			self._error(new Error('maxFileSize exceeded, received ' + self._fileSize + ' bytes of file data'));
			return;
		}
		if (buffer.length === 0) {
			return;
		}

		file.buffer = Buffer.concat([file.buffer, buffer], self._fileSize);
	});

	part.on('end', function () {
		self.emit('file', file.name, file);
	});
};

const flag = '_lemonce_mock_';

module.exports = function multitypeHandler(clientRequestOptions, clientRequest, clientResponse) {
	const form = new IncomingForm();
	form.files = [];

	form.parse(clientRequest, async (err, fields, files) => {
		const data = new formData();
		const fileList = await Promise.all(Object.keys(fields).filter(key => {
			if (key.startsWith(flag)) {
				return true;
			} else {
				data.append(key, fields[key]);
				return false;
			}
		}).map(key => {
			const filename = fields[key];
			const formKey = key.replace(flag, '');

			return new Promise((resolve, reject) => {
				const url = `http://${resourceServer.host}:${resourceServer.port}${resourceServer.apiPrefix || '/'}${filename}`;
				const req = http.request(url, res => {
					let result = Buffer.from([]);
					const contentType = res.headers['content-type'];
					const contentLength = res.headers['content-length'];
					res.on('data', data => result = Buffer.concat([result, data], result.length + data.length));
					res.on('end', () => {
						const a = {
							key: formKey,
							buffer: result,
							option: {
								filename,
								contentType,
								knownLength: contentLength
							}
						};
						resolve(a);
					});
				});

				req.end();
			});
		}));
		
		fileList.forEach(file => data.append(file.key, file.buffer, file.option));
		
		console.log(data);

		delete clientRequestOptions.headers['content-length'];

		const forwardReq = http.request(clientRequestOptions, res => {
			let result = Buffer.from([]);
			res.on('data', data => result = Buffer.concat([result, data], result.length + data.length));
			res.on('end', () => {
				// cloneHeaders(res, clientResponse, false);
				// clientResponse.writeHead(res.statusCode);
				clientResponse.end(result);
			});
		});
		
		// cloneHeaders(clientRequest, forwardReq, false);
		forwardReq.setHeader('content-type', data.getHeaders()['content-type']);
		data.pipe(forwardReq);
	});
};