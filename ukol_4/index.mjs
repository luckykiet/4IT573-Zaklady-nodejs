import { readFile, writeFile } from 'fs';

import { createServer } from 'http';

const PORT = 3000;
const FILE_PATH = 'data.txt';
const RES_HEADER = { 'Content-Type': 'text/plain' };
const INCREASE = 'increase';
const DECREASE = 'decrease';
const READ = 'read';
const ERR_INTERNAL_MSG = 'Internal Server Error';

const server = createServer((req, res) => {
	if (req.url === `/${INCREASE}`) {
		modifyCounter(req, res, 1, 'Increased successfully!');
	} else if (req.url === `/${DECREASE}`) {
		modifyCounter(req, res, -1, 'Decreased successfully!');
	} else if (req.url === `/${READ}`) {
		readCounter(req, res);
	} else {
		res.writeHead(404, RES_HEADER);
		res.end('Not Found');
	}
});

const modifyCounter = (req, res, increment, message = 'OK') => {
	readFile(FILE_PATH, 'utf8', (err, data) => {
		let counter = 0;
		if (!err) {
			counter = isNaN(data) ? 0 : parseInt(data);
		} else if (err.code !== 'ENOENT') {
			console.error(err);
			res.writeHead(500, RES_HEADER);
			res.end(ERR_INTERNAL_MSG);
			return;
		}
		counter += increment;
		writeFile(FILE_PATH, counter.toString(), (err) => {
			if (err) {
				res.writeHead(500, RES_HEADER);
				res.end(ERR_INTERNAL_MSG);
				return;
			}
			res.writeHead(200, RES_HEADER);
			res.end(message);
		});
	});
};

const readCounter = (req, res) => {
	readFile(FILE_PATH, 'utf8', (err, data) => {
		if (err) {
			if (err.code === 'ENOENT') {
				res.writeHead(404, RES_HEADER);
				res.end(
					`Counter is not started yet. Write /${INCREASE} or /${DECREASE}`
				);
			} else {
				console.error(err);
				res.writeHead(500, RES_HEADER);
				res.end(ERR_INTERNAL_MSG);
			}
			return;
		}
		res.writeHead(200, RES_HEADER);
		res.end(data);
	});
};

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
