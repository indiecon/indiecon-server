// function to check if an email is valid

const { errorLogger } = require('./logErrors.utils');

// if email is invalid or there's some error in the function, the responseType will be 'error' and the responseMessage will be 'Email invalid'.

// responsePayload will always be null.
const validateEmail = (email) => {
	try {
		const re =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (re.test(String(email).toLowerCase())) {
			return {
				responseType: 'success',
				responseMessage: 'Email valid',
				responseCode: 200,
				responseUniqueCode: 'email_valid',
				responsePayload: null,
				responseId: 'ycnQ4qWULC7Qs6bd',
			};
		}

		return {
			responseType: 'error',
			responseMessage:
				'Internal error. Please refresh. If the error persists, please contact the team.',
			responseCode: 400,
			responseUniqueCode: 'email_invalid',
			responsePayload: null,
			responseId: '11bvK2gQ47pAiAMy',
		};
	} catch (err) {
		errorLogger('TYJ4vWTbKurajpxV', err);
		return {
			responseType: 'error',
			responseMessage:
				'Internal error. Please refresh. If the error please contact the team.',
			responseCode: 400,
			responseUniqueCode: 'email_invalid',
			responsePayload: null,
			responseId: 'TYJ4vWTbKurajpxV',
		};
	}
};

module.exports = { validateEmail };
