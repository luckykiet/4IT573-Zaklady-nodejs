import { readFile, unlink, writeFile } from 'fs/promises';

async function createFiles() {
	try {
		const data = await readFile('instrukce.txt', 'utf8');

		//zaokrouhlit desetinné číslo na celé
		const n = Math.ceil(parseFloat(data.trim()));

		if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
			throw new Error(
				'Neplatný vstup: počet souborů musí být kladné celé číslo.'
			);
		}

		const promises = [];

		for (let i = 0; i < n; i++) {
			promises.push(writeFile(`${i}.txt`, `Soubor ${i}`));
		}

		await Promise.all(promises);

		console.log(`Vytvořeno ${n} souborů.`);
		process.exit(0);
	} catch (err) {
		console.error('Chyba při vytváření souborů:', err);
		process.exit(1);
	}
}

async function deleteFiles() {
	try {
		const data = await readFile('instrukce.txt', 'utf8');
		const n = Math.ceil(parseFloat(data.trim()));
		const deletePromises = [];
		for (let i = 0; i < n; i++) {
			deletePromises.push(unlink(`${i}.txt`));
		}
		await Promise.all(deletePromises);
		console.log('Všechny soubory byly smazány.');
		process.exit(0);
	} catch (err) {
		console.error('Chyba při mazání souborů:', err);
		process.exit(1);
	}
}

async function processArguments() {
	const command = process.argv[2];

	if (command === 'create') {
		await createFiles();
	} else if (command === 'delete') {
		await deleteFiles();
	} else {
		console.error('Neplatný příkaz. Použijte "create" nebo "delete".');
		process.exit(1);
	}
}

processArguments();
