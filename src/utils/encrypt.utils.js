const CryptoJS = require('crypto-js');

const errorLogger = require('./logErrors.utils');

// data can be an object or a string
export const encrypt = (data) => {
	try {
		const key = process.env.ENCRYPTION_KEY;
		// encrypted is an object of type CryptoJS.lib.CypherParams. We have to convert it to string later.
		// we are stringifying the data because it could be an object. But if it's a string we still need to stringify because in the decrypt function we are parsing the stringified data. So, it's better to stringify it here.
		const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key);
		return {
			responseType: 'success',
			responseUniqueCode: 'encrypted_successfully',
			responsePayload: encrypted.toString(),
			responseCode: 200,
			responseMessage: 'Encrypted successfully',
			responseId: 'jfkaj37492879481ff',
		};
	} catch (err) {
		errorLogger('87847329bkjbkjfsf', err);
		return {
			responseType: 'error',
			responseUniqueCode: 'encrypted_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: '87847329bkjbkjfsf',
		};
	}
};
