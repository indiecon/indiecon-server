const { google } = require('googleapis');

const { initializeGoogleAuth } = require('../googleAuth/config.googleAuth');
const { errorLogger } = require('./logErrors.utils');

const generateAuthUrl = async () => {
	try {
		const scopes = [
			'https://www.googleapis.com/auth/calendar',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email',
		];

		const url = await initializeGoogleAuth().generateAuthUrl({
			access_type: 'offline',
			scope: scopes,
		});

		return {
			responseType: 'success',
			responseUniqueCode: 'generateAuthUrl_success',
			responsePayload: url,
			responseCode: 200,
			responseMessage: '',
			responseId: 'Ia1IPJ7m0QUTrPcn',
		};
	} catch (err) {
		errorLogger('EK5W7aH7Wt4f95kF', err);
		return {
			responseType: 'error',
			responseUniqueCode: 'generateAuthUrl_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'EK5W7aH7Wt4f95kF',
		};
	}
};

const getUserEmail = async ({ code }) => {
	try {
		if (!code) {
			return {
				responseType: 'error',
				responseUniqueCode: 'getUserEmail_error',
				responsePayload: null,
				responseCode: 500,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'HV6gdQ6TjjtGUgMH',
			};
		}

		const oauth2 = google.oauth2({
			version: 'v2',
			auth: initializeGoogleAuth(),
		});

		const { tokens } = await initializeGoogleAuth().getToken(code);

		initializeGoogleAuth().setCredentials(tokens);

		// Get the logged-in user's email
		const { data } = await oauth2.userinfo.get();
		const email = data.email;

		return {
			responseType: 'success',
			responseUniqueCode: 'getUserEmail_success',
			responsePayload: email,
			responseCode: 200,
			responseMessage: '',
			responseId: 'V6zRtcmycFlKWfBr',
		};
	} catch (err) {
		errorLogger('ro74jM8HoTl2XxtD', err);
		return {
			responseType: 'error',
			responseUniqueCode: 'getUserEmail_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'ro74jM8HoTl2XxtD',
		};
	}
};

const scheduleMeet = async ({
	code,
	inviterFirstName,
	meetStartDateTimeInUTC,
	meetEndDateTimeInUTC,
	inviterEmail,
	inviteeEmail,
}) => {
	try {
		const calendar = google.calendar({
			version: 'v3',
			auth: process.env.GOOGLE_API_KEY,
		});

		const { tokens } = await initializeGoogleAuth().getToken(code);

		initializeGoogleAuth().setCredentials(tokens);

		const event = {
			summary: `${inviterFirstName}\'s Indiecon Invite`,
			location: 'Google Meet',
			description: 'This is the meet scheduled by Indiecon',
			start: {
				dateTime: meetStartDateTimeInUTC,
				timeZone: 'Asia/Kolkata',
			},
			end: {
				dateTime: meetEndDateTimeInUTC,
				timeZone: 'Asia/Kolkata',
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
				createRequest: { requestId: '1234567890' },
			},
		};

		calendar.events.insert(
			{
				auth: initializeGoogleAuth(),
				calendarId: 'primary',
				conferenceDataVersion: 1,
				requestBody: event,
			},
			function (err, event) {
				if (err) {
					return {
						responseType: 'error',
						responseUniqueCode: 'scheduleMeet_error',
						responsePayload: null,
						responseCode: 500,
						responseMessage:
							'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
						responseId: 'zwNPAnu07C1k24g4',
					};
				}
				return {
					responseType: 'success',
					responseUniqueCode: 'scheduleMeet_success',
					responsePayload: event,
					responseCode: 200,
					responseMessage: '',
					responseId: 'gFvrmEsR6P1F3kef',
				};
			}
		);
	} catch (err) {
		errorLogger('YIJJxT5vlDj2M1Wl', err);
		return {
			responseType: 'error',
			responseUniqueCode: 'scheduleMeet_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'YIJJxT5vlDj2M1Wl',
		};
	}
};

module.exports = {
	generateAuthUrl,
	getUserEmail,
	scheduleMeet,
};
