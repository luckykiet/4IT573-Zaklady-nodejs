import _ from 'lodash';

const addSpaceForTelephoneNumber = (string, clearPrefix = false) => {
	try {
		let input = string;
		if (clearPrefix) {
			input = input.replace('+420', '');
		}
		const cleanedValue = input.replace(/\s/g, '');
		const formattedValue = cleanedValue.replace(/(\d{3})(?=\d)/g, '$1 ');
		return formattedValue.trim();
	} catch (error) {
		return '';
	}
};

const isValidRequest = (validator, request) => {
	if (!request) {
		console.log('srv_missing_request');
		return false;
	}

	const validKeys = Object.keys(validator);
	const testKeys = Object.keys(request);

	if (testKeys.some((key) => !validKeys.includes(key))) {
		console.log(
			'srv_extra_keys',
			testKeys.filter((key) => !validKeys.includes(key))
		);
		return false;
	}

	// Validate each key
	for (let validKey of validKeys) {
		const validatorFunction = validator[validKey];
		const requestValue = request[validKey];

		if (typeof validatorFunction === 'boolean') {
			return true;
		}

		if (!(validKey in request)) {
			console.log('srv_missing_key', validKey);
			return false;
		}

		if (typeof validatorFunction === 'function') {
			if (!validatorFunction(requestValue)) {
				console.log('srv_invalid_format_function', validKey, requestValue);
				return false;
			}
		} else if (!validatorFunction.test(requestValue)) {
			console.log(
				'srv_invalid_format_key_value',
				validKey,
				validatorFunction,
				requestValue,
				requestValue ? requestValue.length : '',
				request
			);
			return false;
		}
	}

	return true;
};

const createEnumRegex = (array) => {
	if (!array || !_.isArray(array) || _.isEmpty(array)) {
		return /^$/;
	}

	const escapedArray = array.map((item) => _.escapeRegExp(String(item)));
	return new RegExp(`^(${escapedArray.join('|')})$`);
};

const openingTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const emailRegex =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default {
	addSpaceForTelephoneNumber,
	isValidRequest,
	openingTimeRegex,
	emailRegex,
	createEnumRegex,
};
