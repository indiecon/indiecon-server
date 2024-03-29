// middleware to verify the jwt token of the user. If the token is not valid, then it will return 401 status code
const jwt = require('jsonwebtoken');

const { errorLogger } = require('../utils/logErrors.utils');
const { getFounderById } = require('../components/founder/dal.founder');

const verifyAuth = async (req, res, next) => {
	try {
		const authorization = req.headers.authorization;

		if (
			!authorization ||
			typeof authorization !== 'string' ||
			!authorization.trim()
		) {
			return res.status(401).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 401,
				responseUniqueCode: 'unauthorized',
				responsePayload: null,
				responseId: 'fasd89798123111',
			});
		}

		const token = authorization.replace('Bearer ', '');
		if (!token || !token.trim()) {
			return res.status(401).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 401,
				responseUniqueCode: 'unauthorized',
				responsePayload: null,
				responseId: '357uggbvxszscfggtt',
			});
		}

		const decoded = await jwt.verify(token, process.env.JWT_SECRET);

		// decoded contains the object that contains founderId and other details.

		if (!decoded || !decoded.founderId) {
			return res.status(401).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 401,
				responseUniqueCode: 'unauthorized',
				responsePayload: null,
				responseId: 'fncdu3783923923484',
			});
		}

		// check if a user exists with a given founderId
		const userWithId = await getFounderById({ founderId: decoded.founderId });
		if (userWithId.responseType === 'error') {
			return res.status(401).json({
				responseType: 'error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseCode: 401,
				responseUniqueCode: 'unauthorized',
				responsePayload: null,
				responseId: 'fasflkjf9798237j1414117908',
			});
		}

		// storing decoded object in the request body so that we can use it in future middlewares.
		// It is being used in the routes and logging middleware, so that we can log the founderId in the logs.
		req.user = decoded;
		next();
	} catch (error) {
		errorLogger('93276398hhfkjhaskh', error);
		return res.status(401).json({
			responseType: 'error',
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseCode: 401,
			responseUniqueCode: 'unauthorized',
			responsePayload: null,
			responseId: '93276398hhfkjhaskh',
		});
	}
};

module.exports = { verifyAuth };
