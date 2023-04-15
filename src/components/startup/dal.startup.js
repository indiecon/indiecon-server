const StartupModel = require('./models.startup');
const { errorLogger } = require('../../utils/logErrors.utils');

// Creates a new startup which is empty. The user can then fill in the details afterwards.
// returns an error object with payload null or a success object with payload as savedStartup object.
const createNewStartup = async () => {
	try {
		const newStartup = new StartupModel({
			name: '',
			description: '',
			mainLink: '',
			socialLink: '',
			industry: '',
		});

		const savedStartup = await newStartup.save();
		if (!savedStartup) {
			return {
				responseType: 'error',
				responseUniqueCode: 'create_new_startup_error',
				responsePayload: null,
				responseCode: 500,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: '0PfDBidTKPTF',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'create_new_startup_success',
			responsePayload: savedStartup,
			responseCode: 200,
			responseMessage: 'New startup created',
			responseId: 'SuBRilZkAQvS',
		};
	} catch (error) {
		errorLogger('NRsMXkhampuW', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'create_new_startup_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'NRsMXkhampuW',
		};
	}
};

module.exports = {
	createNewStartup,
};
