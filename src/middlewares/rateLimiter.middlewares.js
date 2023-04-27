const rateLimit = require('express-rate-limit');

// config for rate limiter
const rateLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
	standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: {
		responseType: 'error',
		responseMessage: 'Too many requests, please try again later',
		responseCode: 429,
		responseUniqueCode: 'too_many_requests',
		responsePayload: null,
		responseId: '1837819fkajsdfhk847298',
	},
});

module.exports = { rateLimiter };
