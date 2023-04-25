const { google } = require('googleapis');

const initializeGoogleAuth = async () => {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		`${process.env.FRONTEND_URL}/google/redirect`
	);

	return oauth2Client;
};

module.exports = { initializeGoogleAuth };
