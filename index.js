const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

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
const { verifyAuth } = require('./src/middlewares/verifyAuth.middlewares.js');

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
		responseMessage: 'Extension server is up and running',
		responseCode: 200,
		responseUniqueCode: 'extension_server_healthy',
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

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.FRONTEND_URL}/google/redirect`
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

const scopes = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email',
];

app.get('/api/v1/google/url', [verifyOrigin, verifyAuth], async (req, res) => {
	try {
		const url = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: scopes,
		});

		const response = {
			responseType: 'success',
			responseUniqueCode: 'generateAuthUrl_success',
			responsePayload: url,
			responseCode: 200,
			responseMessage: '',
			responseId: 'Ia1IPJ7m0QUTrPcn',
		};

		return res.status(response.responseCode).json(response);
	} catch (err) {
		errorLogger('EK5W7aH7Wt4f95kF', err);
		const response = {
			responseType: 'error',
			responseUniqueCode: 'generateAuthUrl_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'EK5W7aH7Wt4f95kF',
		};

		return res.status(response.responseCode).json(response);
	}
});

// no verify origin or verify auth because this is called from backend.
app.post('/api/v1/google/schedule', async (req, res) => {
	try {
		const {
			code,
			inviterFirstName,
			meetStartDateTimeInUTC,
			meetEndDateTimeInUTC,
			inviterEmail,
			inviteeEmail,
		} = req.body;

		if (
			!code ||
			!inviterFirstName ||
			!meetStartDateTimeInUTC ||
			!meetEndDateTimeInUTC ||
			!inviterEmail ||
			!inviteeEmail
		) {
			return res.status(400).json({
				responseType: 'error',
				responseUniqueCode: 'scheduleMeet_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'HV6gdQ6TjjtGUgMH',
			});
		}

		const { tokens } = await oauth2Client.getToken(code);

		oauth2Client.setCredentials(tokens);

		// Get the logged-in user's email
		const { data } = await oauth2.userinfo.get();
		const email = data.email;

		if (email !== inviteeEmail) {
			return res.status(401).json({
				responseType: 'error',
				responseUniqueCode: 'scheduleMeet_error',
				responsePayload: null,
				responseCode: 401,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'XT2KI0WH8CP3aY0n',
			});
		}

		const event = {
			summary: `Indiecon Invite by ${inviterFirstName}`,
			location: 'Google Meet',
			description: `This is the meet scheduled by ${inviterFirstName} via Indiecon`,
			start: {
				dateTime: meetStartDateTimeInUTC,
			},
			end: {
				dateTime: meetEndDateTimeInUTC,
			},
			attendees: [{ email: inviterEmail }, { email: inviteeEmail }],
			reminders: {
				useDefault: false,
				overrides: [
					{ method: 'email', minutes: 60 },
					{ method: 'popup', minutes: 10 },
				],
			},
			conferenceData: {
				createRequest: {
					requestId: Math.floor(
						1000000000 + Math.random() * 9000000000
					).toString(),
				},
			},
			sendUpdates: 'all',
		};

		calendar.events.insert(
			{
				auth: oauth2Client,
				calendarId: 'primary',
				conferenceDataVersion: 1,
				requestBody: event,
			},
			function (err, event) {
				if (err) {
					return res.status(400).json({
						responseType: 'error',
						responseUniqueCode: 'scheduleMeet_error',
						responsePayload: null,
						responseCode: 400,
						responseMessage:
							'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
						responseId: 'zwNPAnu07C1k24g4',
					});
				}
				return res.status(200).json({
					responseType: 'success',
					responseUniqueCode: 'scheduleMeet_success',
					responsePayload: event.data,
					responseCode: 200,
					responseMessage: '',
					responseId: 'gFvrmEsR6P1F3kef',
				});
			}
		);
	} catch (err) {
		errorLogger('YIJJxT5vlDj2M1Wl', err);
		return res.status(500).json({
			responseType: 'error',
			responseUniqueCode: 'scheduleMeet_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'YIJJxT5vlDj2M1Wl',
		});
	}
});

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
