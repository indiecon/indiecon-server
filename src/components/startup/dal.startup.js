const StartupModel = require('./models.startup');
const FounderModel = require('../founder/models.founder');
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

const updateStartupProfile = async (context) => {
	try {
		if (
			!context ||
			!context.startupId ||
			!context.founderId ||
			!context.startupId.trim() ||
			!context.founderId.trim()
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'update_startup_profile_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Bad request. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'xHah4DA8K5DGQ7iU',
			};
		}

		let {
			startupId,
			name,
			description,
			mainLink,
			socialLink,
			industry,
			founderId,
			isFounderProfileComplete,
		} = context;

		startupId = startupId.trim();
		founderId = founderId.trim();
		name = name ? name.trim() : '';
		description = description ? description.trim() : '';
		mainLink = mainLink ? mainLink.trim() : '';
		socialLink = socialLink ? socialLink.trim() : '';
		industry = industry ? industry.trim() : '';

		const updatedStartup = await StartupModel.findByIdAndUpdate(
			startupId,
			{
				name,
				description,
				mainLink,
				socialLink,
				industry,
			},
			{ new: true }
		);

		if (!updatedStartup) {
			return {
				responseType: 'error',
				responseUniqueCode: 'update_startup_profile_error',
				responsePayload: null,
				responseCode: 500,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'wfh0cAUjudIH9JG6',
			};
		}

		const isStartupProfileComplete =
			updatedStartup.name &&
			updatedStartup.description &&
			updatedStartup.mainLink &&
			updatedStartup.socialLink &&
			updatedStartup.industry;

		const updatedFounder = await FounderModel.findByIdAndUpdate(
			founderId,
			{
				areBothProfilesComplete:
					isFounderProfileComplete && isStartupProfileComplete ? true : false,
			},
			{ new: true }
		);

		if (!updatedFounder) {
			return {
				responseType: 'error',
				responseUniqueCode: 'update_startup_profile_error',
				responsePayload: null,
				responseCode: 500,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'dYI0ctmiCiVUVur1',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'update_startup_profile_success',
			responsePayload: updatedStartup,
			responseCode: 200,
			responseMessage: 'Startup profile updated',
			responseId: 'Y7bOkPVCe6hPpQlU',
		};
	} catch (error) {
		errorLogger('fPnNgoPl4tJx1shv', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'update_startup_profile_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'fPnNgoPl4tJx1shv',
		};
	}
};

module.exports = {
	createNewStartup,
	updateStartupProfile,
};
