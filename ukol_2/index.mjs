import { dirname, join } from 'path';
import { readFile, writeFile } from 'fs/promises';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

readFile('instrukce.txt', 'utf8')
	.then((data) => {
		const bufferStringSplit = data.trim().split(' ');

		if (bufferStringSplit.length !== 2) {
			throw new Error(
				'Musite zadat vstupni a vystupni soubor oddeleno mezerou.'
			);
		}

		const inputFilePath = bufferStringSplit[0].trim();
		const outputFilePath = bufferStringSplit[1].trim();

		return readFile(inputFilePath, 'utf8').then((input) => {
			if (!input.trim()) {
				throw new Error(`Vstupni soubor "${inputFilePath}" je prazdny.`);
			}

			const outputFilePathResolved = join(__dirname, outputFilePath);
			return writeFile(outputFilePathResolved, input).then(() => {
				console.log(`Soubor "${outputFilePathResolved}" uspesne vytvoren.`);
				process.exit(0);
			});
		});
	})
	.catch((error) => {
		console.error(`Chyba: ${error}`);
		process.exit(1);
	});
