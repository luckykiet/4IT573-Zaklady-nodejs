const randomNumber = Math.floor(Math.random() * 10) + 1;

const checkGuess = (guess) => {
	if (guess === randomNumber) {
		console.log('Gratuluji, uhadl jsi spravne cislo!');
	} else {
		console.log('Bohuzel, neuhodl jsi spravne cislo. Zkusis to znovu?');
		guessNumber();
	}
};

const guessNumber = () => {
	const guess = parseInt(prompt('Tipni cislo od 1 do 10:'));
	if (isNaN(guess) || guess < 1 || guess > 10) {
		console.log('Prosim, zadej platne cislo od 1 do 10.');
		guessNumber();
	} else {
		checkGuess(guess);
	}
};

guessNumber();
