const CryptoJS = require('crypto-js');

const errorLogger = require('./logErrors.utils');

// function to decrypt the data where data is the encrypted data
const decrypt = (data) => {
	try {
		const key = process.env.ENCRYPTION_KEY;
		// decrypted is an object of type CryptoJS.lib.WordArray. We have to convert it to string later.
		const decrypted = CryptoJS.AES.decrypt(data, key);
		return {
			responseType: 'success',
			responseUniqueCode: 'decrypted_successfully',
			responsePayload: JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)), // parsing the decrypted string beause we have stringified it in the encrypt function
			responseMessage: 'Decrypted successfully',
			responseCode: 200,
			responseId: 'ajsh7789938491231',
		};
	} catch (err) {
		errorLogger('fasd7823498172938f', err);
		return {
			responseType: 'error',
			responseUniqueCode: 'decrypted_error',
			responsePayload: null,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseCode: 500,
			responseId: 'fasd7823498172938f',
		};
	}
};

module.exports = { decrypt };
