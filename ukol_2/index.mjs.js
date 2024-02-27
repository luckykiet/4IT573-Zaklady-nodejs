/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');
try {
	const io = fs.readFileSync('instrukce.txt', 'utf8').split(' ');

	if (io.length !== 2) {
		throw 'Musite zadat vstupni a vystupni soubor oddeleno mezerou.';
	}

	let input = '';

	try {
		input = fs.readFileSync(io[0], 'utf8');
	} catch (error) {
		throw `Chyba nacitani vstupniho souboru "${io[0]}".`;
	}

	if (input === '') {
		throw `Vstupni soubor "${io[0]}" je prazdny.`;
	}

	try {
		const localeFolderPath = path.join(__dirname, io[1]);
		fs.writeFileSync(localeFolderPath, input);
	} catch (error) {
		throw `Chyba tvorby souboru "${io[1]}".`;
	}

	console.log(`Soubor "${io[1]}" uspesne vytvoren.`);
	process.exit(1);
} catch (error) {
	console.error(error);
	process.exit(1);
}
