const jwt = require('jsonwebtoken');

const { errorLogger } = require('./logErrors.utils');

// jwtObject is the object that needs to be tokenised
// jwtObject = {userId: '1234567890'} userId is string.
const generateJWT = async (jwtObject) => {
	try {
		let { userId } = jwtObject;

		if (!userId || typeof userId !== 'string' || !userId.trim()) {
			return {
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 400,
				responseUniqueCode: 'user_id_required',
				responsePayload: null,
				responseId: '230810nlksnldfkslkj',
			};
		}

		userId = userId.trim();
		const token = await jwt.sign(jwtObject, process.env.JWT_SECRET);
		return {
			responseType: 'success',
			responseMessage: 'Token generated',
			responseCode: 200,
			responseUniqueCode: 'token_generated',
			responsePayload: token,
			responseId: '787857tfjbknlkbjhkj',
		};
	} catch (err) {
		errorLogger('37129wbfkjszdksfns', err);
		return {
			responseType: 'error',
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseCode: 500,
			responseUniqueCode: 'error_generating_token',
			responsePayload: null,
			responseId: '37129wbfkjszdksfns',
		};
	}
};

module.exports = { generateJWT };
