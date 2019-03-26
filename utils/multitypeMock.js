const http = require('http');
const formidable = require('formidable');
const FormData = require('form-data');
const StringDecoder = require('string_decoder').StringDecoder;
const cloneHeaders = require('./cloneHeaders.js');
const { resourceServer } = require('../config');
const _ = require('lodash');

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
		field: part.name,
		filename: part.filename,
		contentType: part.mime,
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

function parserForm(request) {
	const form = new IncomingForm();
	form.files = [];

	return new Promise((resolve, reject) => {
		form.parse(request, (err, fields, files) => {
			if (err) {
				reject(err);
			} else {
				resolve({ fields, files });
			}
		});
	});
}

function getFileList(mockInfo) {
	return Promise.all(mockInfo.map(fileInfo => {
		const { field, filename, contentType } = fileInfo;

		return new Promise((resolve, reject) => {
			const url = `http://${resourceServer.host}:${resourceServer.port}${resourceServer.apiPrefix || '/'}${filename}`;
			const req = http.request(url, res => {
				let result = Buffer.from([]);
				const contentLength = res.headers['content-length'];

				res.on('data', data => result = Buffer.concat([result, data], result.length + data.length));
				res.on('end', () => {
					const file = {
						field,
						buffer: result,
						option: {
							filename,
							contentType: contentType || res.headers['content-type'],
							knownLength: contentLength
						}
					};

					resolve(file);
				});
			});

			req.on('error', error => reject(error));

			req.end();
		});
	}));
}

const MOCK_INFO_FIELD = '_lemonce_mock_';

module.exports = async function multitypeHandler(clientRequestOptions, clientRequest, clientResponse) {
	const form = new IncomingForm();
	form.multiples = true;
	form.files = [];

	const boundary = clientRequestOptions.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
	const formData = new FormData({ _boundary: boundary[1] || boundary[2] });

	let body = Buffer.from([]);
	clientRequest.on('data', data => body = Buffer.concat([body, data], body.length + data.length));

	const { fields } = await parserForm(clientRequest);

	const mockInfo = fields[MOCK_INFO_FIELD];

	if (!mockInfo) {
		return new Promise((resolve, reject) => {
			const forwardRequest = http.request(clientRequestOptions, forwardResponse => {
				forwardResponse.pipe(clientResponse);
				resolve(false);
			});

			forwardRequest.on('error', error => reject(error));
	
			forwardRequest.end(body);
		});
	}

	delete fields[MOCK_INFO_FIELD];
	
	_.forEach(fields, (value, key) => {
		formData.append(key, value);
	});

	const fileList = await getFileList(JSON.parse(mockInfo));

	fileList.forEach(file => formData.append(file.field, file.buffer, file.option));

	clientRequestOptions.headers['content-type'] = formData.getHeaders()['content-type'];
	delete clientRequestOptions.headers['content-length'];

	return new Promise((resolve, reject) => {
		const mockRequest = http.request(clientRequestOptions);
		
		mockRequest.on('response', mockResponse => {
			let result = Buffer.from([]);
			mockResponse.on('data', data => result = Buffer.concat([result, data], result.length + data.length));
			mockResponse.on('end', () => {
				cloneHeaders(mockResponse, clientResponse, false);
				clientResponse.writeHead(mockResponse.statusCode);
				clientResponse.end(result);
				resolve(true);
			});
		});
		
		mockRequest.on('error', error => reject(error));
		
		formData.pipe(mockRequest);
	});
};