const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const { config } = require('./src/config/config');
const { db } = require('./src/db/mongoClient');
const {
	verifyOrigin,
} = require('./src/middlewares/verifyOrigin.middlewares.js');
const { rateLimiter } = require('./src/middlewares/rateLimiter.middlewares.js');
const {
	networkLoggerMiddleware,
} = require('./src/middlewares/networkLogger.middlewares.js');
const {
	generateCustomHeader,
} = require('./src/utils/generateCustomHeader.utils');
const { errorLogger } = require('./src/utils/logErrors.utils');

const app = express();

// Order of middlewares:
// 1. cors - to allow cross origin requests so that browser can make the preflight request to the server.
// 2. helmet - to set security headers
// 3. trust proxy - to trust the x-forwarded-for header from nginx so that rate limiter and other middlewares can work properly
// 4. rate limiter - to rate limit the requests from a single ip. This should be used globally for all the routes. We don't want to process even a single bit without rate limiting. Not even any error by middlewares.
// 5. body parser - to parse the body of the request so that network logger can use the body.
// 6. network logger - to log the requests and responses coming over the network. This should be used globally for all the routes.
// 7. error handler - to handle all the errors generated by the middlewares.

app.use(cors());
app.use(helmet());
// trust proxy is set to 1 if the app is in production or staging because it would be in an ec2 instance behind nginx. also, add a line in nginx config to add the x-forwarded-for header.
// Nginx config: proxy_set_header X-Forwarded-For $remote_addr; add this in the server block of the nginx config file.

app.set('trust proxy', true);

// middleware function to rateLimit the requests from a single Ip and it's config. Rate limiting should be used globally for all routes unlike verifyOrigin middleware, because we want to rate limit all the routes.
app.use(rateLimiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// custom middleware function to log requests and responses coming over from network using morgan. contains configuration for morgan as well.

networkLoggerMiddleware(app);

// error handler for all the errors generated by the middlewares.
app.use((err, _req, res, _next) => {
	errorLogger('fasdfkhjhju343hsjfh', err);
	res.status(500).json({
		responseType: 'error',
		responseMessage: 'Internal error. Please contact the team!',
		responseCode: 500,
		responseUniqueCode: 'internal_server_error',
		responsePayload: null,
		responseId: 'fasdfkhjhju343hsjfh',
	});
});

db.on('error', (error) => {
	console.error('Error connecting to database', error);
	process.exit(1);
});
db.once('open', () => console.log('Connected to Database'));

// health check route
app.get('/', (_req, res) => {
	res.status(200).json({
		responseType: 'success',
		responseMessage: 'Indiecon server is up and running',
		responseCode: 200,
		responseUniqueCode: 'server_healthy',
		responsePayload: null,
		responseId: '238279hskdjfh827389bkjsb',
		env: process.env.NODE_ENV, // so that we can verify the env and the domain of the server.
	});
});

// middleware function to verify the origin of the request from the x-custom-header is used in the requests and not globally because we dont want to check origin for the health check route and the fallback route.
app.use(
	'/api/v1/founder',
	verifyOrigin,
	require('./src/components/founder/routes.founder')
);

app.use(
	'/api/v1/startup',
	verifyOrigin,
	require('./src/components/startup/routes.startup')
);

app.use(
	'/api/v1/invite',
	verifyOrigin,
	require('./src/components/invite/routes.invite')
);

// for fallback routes (not found or malformed routes)
app.use((_req, res) => {
	res.status(404).json({
		responseType: 'error',
		responseMessage: 'Route not found.',
		responseCode: 404,
		responseUniqueCode: 'route_not_found',
		responsePayload: null,
		responseId: '68hbhjfteu567ihvswe45678uijh',
	});
});

// function to generate x-custom-header for testing in the localhost
if (process.env.NODE_ENV === 'development') {
	console.log(generateCustomHeader());
}

app.listen(config.app.port, () =>
	console.log(`Server started on port ${config.app.port}`)
);
