const redis = require('../db/redisClient');
const { errorLogger } = require('../utils/logErrors.utils');
const { decrypt } = require('../utils/decrypt.utils');

const verifyOrigin = async (req, res, next) => {
	try {
		// x-custom-header is the header that will be sent from the origin source to the server just to verify if the request is coming from a valid origin source and is not forged or tampered with.
		// x-custom-header will be of the form 'origin::timestamp::randomString' and encrypted using AES algorithm.
		const customHeader = req.headers['x-custom-header'];

		if (
			!customHeader ||
			typeof customHeader !== 'string' ||
			!customHeader.trim()
		) {
			return res.status(403).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 403,
				responseUniqueCode: 'missing_custom_header',
				responsePayload: null,
				responseId: 'header_error',
			});
		}

		const customHeaderValue = customHeader.trim();
		const decryptedHeaderObject = decrypt(customHeaderValue);

		if (decryptedHeaderObject.responseType === 'error') {
			return res.status(403).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseUniqueCode: 'missing_custom_header',
				responseCode: 403,
				responsePayload: decryptedHeaderObject.responsePayload,
				responseId: decryptedHeaderObject.responseId,
			});
		}

		// origin::timestamp::randomString as string
		const decryptedHeaderValue = decryptedHeaderObject.responsePayload;

		const decryptedData = decryptedHeaderValue.split('::');
		const origin = decryptedData[0];
		const timestampString = decryptedData[1];
		const randomString = decryptedData[2];

		if (
			!origin ||
			!timestampString ||
			!randomString ||
			!randomString.trim() ||
			!timestampString.trim() ||
			!origin.trim()
		) {
			return res.status(403).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 403,
				responseUniqueCode: 'header_error',
				responsePayload: null,
				responseId: 'flkajs4739847873',
			});
		}

		const currentTime = new Date().getTime();
		const timeDifference = currentTime - Number(timestampString);

		// 5 minutes
		if (timeDifference > 300000) {
			return res.status(403).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 403,
				responseUniqueCode: 'header_error',
				responsePayload: null,
				responseId: '238798sdglksmdflkn',
			});
		}

		const acceptedOrigins = [
			'postman',
			'production',
			'localhost',
			'indiecon_webapp',
		];

		if (!acceptedOrigins.includes(origin)) {
			return res.status(403).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 403,
				responseUniqueCode: 'header_error',
				responsePayload: null,
				responseId: '2380180sdnlnfsn',
			});
		}

		// Check if request is duplicate by checking if redis has a value for key random string.
		const redisGetResponse = await redis.get(randomString);
		if (redisGetResponse === '1' || redisGetResponse === 1) {
			return res.status(403).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 403,
				responseUniqueCode: 'header_error',
				responsePayload: null,
				responseId: 'fasd762871538170',
			});
		}

		// Set redis value to '1' for key random string.
		redis.set(randomString, '1');
		next();
	} catch (error) {
		errorLogger('flsj3748979efajldflkj8hkj1h2', error);
		return res.status(500).json({
			responseType: 'error',
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseCode: 500,
			responseUniqueCode: 'header_error',
			responsePayload: null,
			responseId: 'flsj3748979efajldflkj8hkj1h2',
		});
	}
};

module.exports = { verifyOrigin };
