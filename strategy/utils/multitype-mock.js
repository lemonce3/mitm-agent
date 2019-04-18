const http = require('http');
const formidable = require('formidable');
const FormData = require('form-data');
const StringDecoder = require('string_decoder').StringDecoder;
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
		self.emit('file', part.name, file);
	});
};

function parserForm(request) {
	const form = new IncomingForm();
	form.multiples = true;
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

function getFileList(mockInfo, observer) {
	const fileList = [];
	_.forEach(mockInfo, (file, field) => {
		file.forEach(file => {
			fileList.push({
				field,
				filename: file.name,
				hash: file.hash
			});
		});
	});

	return Promise.all(fileList.map(fileInfo => {
		const { field, filename, hash } = fileInfo;

		return new Promise((resolve, reject) => {
			const url = `${observer.protocol}//${observer.hostname}:${observer.port}${observer.apiPrefix}/${hash}`;
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
							contentType: res.headers['content-type'],
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

module.exports = async function multitypeHandler(ctx, options) {
	const form = new IncomingForm();
	form.multiples = true;
	form.files = [];

	const boundary = ctx.request.options.headers['content-type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
	const formData = new FormData({ _boundary: boundary[1] || boundary[2] });

	let originBody = Buffer.from([]);
	ctx.request.body.on('data', data => originBody = Buffer.concat([originBody, data], originBody.length + data.length));

	const { fields } = await parserForm(ctx.request.body);

	const mockInfo = fields[options.mockInfoField];

	if (!mockInfo) {
		return {
			options: ctx.request.options,
			body: originBody
		};
	}

	delete fields[options.mockInfoField];
	
	_.forEach(fields, (value, key) => {
		formData.append(key, value);
	});

	const fileList = await getFileList(JSON.parse(mockInfo), options.observerOptions);

	fileList.forEach(file => formData.append(file.field, file.buffer, file.option));

	ctx.request.options.headers['content-type'] = formData.getHeaders()['content-type'];
	delete ctx.request.options.headers['content-length'];

	return {
		options: ctx.request.options,
		body: formData
	};
};