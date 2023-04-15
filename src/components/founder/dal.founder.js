const FounderModel = require('./models.founder');
const { validateEmail } = require('../../utils/validators.utils');
const { errorLogger } = require('../../utils/logErrors.utils');
const { createNewStartup } = require('../startup/dal.startup');
const { generateJWT } = require('../../utils/generateJWT.utils');

// gets founder by given id. returns error or success. if success, payload is the founder object or null if not found. error only when validation error or internal error
const getFounderById = async (context) => {
	try {
		if (!context || !context.founderId || !context.founderId.trim())
			return {
				responseType: 'error',
				responseUniqueCode: 'get_founder_byId_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact t	he team.',
				responseId: 'XxKJrtoyBMqD',
			};

		let { founderId } = context;
		founderId = founderId.trim();

		const fetchedFounder = await FounderModel.findById(founderId).populate(
			'startupId'
		);

		if (!fetchedFounder) {
			return {
				responseType: 'success',
				responseUniqueCode: 'no_founder_by_id',
				responsePayload: null,
				responseCode: 404,
				responseMessage: 'Founder not found',
				responseId: 'PCVomkceRFHL',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'founder_by_id_found',
			responsePayload: fetchedFounder,
			responseCode: 200,
			responseMessage: 'Founder found',
			responseId: 'HZYqPDfekPoZ',
		};
	} catch (error) {
		errorLogger('gbhXjkUvEpqX', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'get_founder_byId_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'gbhXjkUvEpqX',
		};
	}
};

// gets founder by given email. returns error or success. if success, payload is the founder object or null if not found. error only when validation error or internal error
const getFounderByEmail = async (context) => {
	try {
		if (!context || !context.email || !context.email.trim())
			return {
				responseType: 'error',
				responseUniqueCode: 'get_founder_byEmail_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'BsH9GvmYUk5l',
			};

		let { email } = context;
		email = email.trim();
		email = email.toLowerCase();

		// validate email
		const validateEmailResult = validateEmail(email);
		if (validateEmailResult.responseType === 'error')
			return {
				responseType: 'error',
				responseUniqueCode: 'get_founder_byEmail_error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responsePayload: validateEmailResult.responsePayload,
				responseCode: validateEmailResult.responseCode,
				responseId: validateEmailResult.responseId,
			};

		const fetchedFounderArray = await FounderModel.find({ email }).populate(
			'startupId'
		);

		if (!fetchedFounderArray || fetchedFounderArray.length === 0)
			return {
				responseType: 'success',
				responseUniqueCode: 'no_founder_by_email',
				responsePayload: null,
				responseCode: 404,
				responseMessage: 'Founder not found',
				responseId: '5ShNrpxuMawS',
			};

		return {
			responseType: 'success',
			responseUniqueCode: 'founder_by_email_found',
			responsePayload: fetchedFounderArray[0],
			responseCode: 200,
			responseMessage: 'Founder found',
			responseId: 'kzvMZ2WWj8g6',
		};
	} catch (error) {
		errorLogger('BTVS5T3xTGuT', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'get_founder_byEmail_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'BTVS5T3xTGuT',
		};
	}
};

// creates an empty founder with just an email, startupId and returns the founder
const createNewFounder = async (context) => {
	try {
		if (
			!context ||
			!context.email ||
			!context.email.trim() ||
			!context.startupId ||
			!context.startupId.trim()
		)
			return {
				responseType: 'error',
				responseUniqueCode: 'create_new_founder_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'U6WTkFmQ6i3c',
			};

		let { email, startupId } = context;
		email = email.trim();
		email = email.toLowerCase();

		startupId = startupId.trim();

		// validate email
		const validateEmailResult = validateEmail(email);
		if (validateEmailResult.responseType === 'error')
			return {
				responseType: 'error',
				responseUniqueCode: 'create_new_founder_error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responsePayload: validateEmailResult.responsePayload,
				responseCode: validateEmailResult.responseCode,
				responseId: validateEmailResult.responseId,
			};

		const newFounderResult = await FounderModel.create({
			email,
			firstName: '',
			lastName: '',
			twitterUsername: '',
			bio: '',
			startupId,
		});

		if (!newFounderResult)
			return {
				responseType: 'error',
				responseUniqueCode: 'create_new_founder_error',
				responsePayload: null,
				responseCode: 500,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'QU9p7qHxmeqifWuo',
			};

		return {
			responseType: 'success',
			responseUniqueCode: 'create_new_founder_success',
			responsePayload: newFounderResult,
			responseCode: 200,
			responseMessage: 'Founder created',
			responseId: 'Qchm4DVB5QiAovsc',
		};
	} catch (error) {
		errorLogger('0H562oAu2GeU', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'create_new_founder_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: '0H562oAu2GeU',
		};
	}
};

// takes email in context object, checks if the user is new or not. If user is new, creates an empty startup for him. After checking old or new and creating new founder if new, logs in the user and returns the jwt token in payload
const loginFounder = async (context) => {
	try {
		if (!context || !context.email || !context.email.trim())
			return {
				responseType: 'error',
				responseUniqueCode: 'login_founder_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'mtAaxSqUB8lG0Udi',
			};

		let { email } = context;
		email = email.trim();
		email = email.toLowerCase();

		// validate email
		const validateEmailResult = validateEmail(email);
		if (validateEmailResult.responseType === 'error')
			return {
				responseType: 'error',
				responseUniqueCode: 'login_founder_error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responsePayload: validateEmailResult.responsePayload,
				responseCode: validateEmailResult.responseCode,
				responseId: validateEmailResult.responseId,
			};

		// check if founder exists
		const founderExistsResult = await getFounderByEmail({ email });
		if (founderExistsResult.responseType === 'error')
			return {
				responseType: 'error',
				responseUniqueCode: 'login_founder_error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responsePayload: founderExistsResult.responsePayload,
				responseCode: founderExistsResult.responseCode,
				responseId: founderExistsResult.responseId,
			};

		let userIdForToken = null;

		if (founderExistsResult.responseCode === 404) {
			// create startup
			const createStartupResult = await createNewStartup();
			if (createStartupResult.responseType === 'error')
				return {
					responseType: 'error',
					responseUniqueCode: 'login_founder_error',
					responseMessage:
						'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
					responsePayload: createStartupResult.responsePayload,
					responseCode: createStartupResult.responseCode,
					responseId: createStartupResult.responseId,
				};

			// create founder
			const createFounderResult = await createNewFounder({
				email,
				startupId: createStartupResult.responsePayload.id,
			});
			if (createFounderResult.responseType === 'error')
				return {
					responseType: 'error',
					responseUniqueCode: 'login_founder_error',
					responseMessage:
						'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
					responsePayload: createFounderResult.responsePayload,
					responseCode: createFounderResult.responseCode,
					responseId: createFounderResult.responseId,
				};

			userIdForToken = createFounderResult.responsePayload.id;
		} else {
			userIdForToken = founderExistsResult.responsePayload.id;
		}

		// create token
		const createTokenResult = await generateJWT({ founderId: userIdForToken });
		if (createTokenResult.responseType === 'error')
			return {
				responseType: 'error',
				responseUniqueCode: 'login_founder_error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responsePayload: createTokenResult.responsePayload,
				responseCode: createTokenResult.responseCode,
				responseId: createTokenResult.responseId,
			};

		return {
			responseType: 'success',
			responseUniqueCode: 'login_founder_success',
			responsePayload: {
				token: createTokenResult.responsePayload,
			},
			responseCode: 200,
			responseMessage: 'Login successful',
			responseId: 'Ic5bepSXTNXzOHJP',
		};
	} catch (error) {
		errorLogger('EtLDWNN7l5eL', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'login_founder_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'EtLDWNN7l5eL',
		};
	}
};

const updateFounderProfile = async (context) => {
	try {
		if (!context) {
			return {
				responseType: 'error',
				responseUniqueCode: 'update_founder_profile_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'mSDHNiYRmMbEs4ON',
			};
		}

		let { firstName, lastName, twitterUsername, bio, founderId } = context;

		if (!founderId || !founderId.trim()) {
			return {
				responseType: 'error',
				responseUniqueCode: 'update_founder_profile_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'zQ8mTUotix3Mnr7Z',
			};
		}

		founderId = founderId.trim();

		firstName = firstName ? firstName.trim() : '';
		lastName = lastName ? lastName.trim() : '';
		twitterUsername = twitterUsername ? twitterUsername.trim() : '';
		bio = bio ? bio.trim() : '';

		const currentUserandStartupResult = await getFounderById({
			founderId,
		});
		if (
			currentUserandStartupResult.responseType === 'error' ||
			currentUserandStartupResult.responseCode === 404
		)
			return {
				responseType: 'error',
				responseUniqueCode: 'update_founder_profile_error',
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responsePayload: currentUserandStartupResult.responsePayload,
				responseCode: currentUserandStartupResult.responseCode,
				responseId: currentUserandStartupResult.responseId,
			};

		const currentStartupName =
			currentUserandStartupResult.responsePayload.startupId.name;
		const currentStartupDescription =
			currentUserandStartupResult.responsePayload.startupId.description;
		const currentStartupMainLink =
			currentUserandStartupResult.responsePayload.startupId.mainLink;
		const currentStartupSocialLink =
			currentUserandStartupResult.responsePayload.startupId.socialLink;
		const currentStartupIndustry =
			currentUserandStartupResult.responsePayload.startupId.industry;

		const isFounderProfileComplete =
			firstName && lastName && twitterUsername && bio;
		const isStartupProfileComplete =
			currentStartupName &&
			currentStartupDescription &&
			currentStartupMainLink &&
			currentStartupSocialLink &&
			currentStartupIndustry;

		const updateFounderResult = await FounderModel.findByIdAndUpdate(
			founderId,
			{
				firstName,
				lastName,
				twitterUsername,
				bio,
				areBothProfilesComplete:
					isFounderProfileComplete && isStartupProfileComplete ? true : false,
			},
			{ new: true }
		);

		if (!updateFounderResult) {
			return {
				responseType: 'error',
				responseUniqueCode: 'update_founder_profile_error',
				responsePayload: null,
				responseCode: 404,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'uoejfbemmC4HNLba',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'update_founder_profile_success',
			responsePayload: updateFounderResult,
			responseCode: 200,
			responseMessage: 'Founder profile updated successfully',
			responseId: 'qLcg3nctHx1KpbQ7',
		};
	} catch (error) {
		errorLogger('j7KCmWOkVCdPYYvc', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'update_founder_profile_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'j7KCmWOkVCdPYYvc',
		};
	}
};

const listFounders = async (context) => {
	try {
		const limit = context.limit || 10;
		const page = context.page || 1;

		// get founders whose areBothProfilesComplete is true and also populate startup data for cooresponding startupId. Also, areBothProfilesComplete of startup should be true. Fist populate and then skip the ones whose startupId is null

		const founders = await FounderModel.find({
			areBothProfilesComplete: true,
		})
			.populate('startupId')
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({ createdAt: -1 });

		if (!founders) {
			return {
				responseType: 'error',
				responseUniqueCode: 'list_founders_error',
				responsePayload: null,
				responseCode: 500,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'eBWitiOocr8fKPQI',
			};
		}

		if (founders.length === 0) {
			return {
				responseType: 'success',
				responseUniqueCode: 'no_founders_found',
				responsePayload: [],
				responseCode: 404,
				responseMessage: 'No founders found',
				responseId: 'uA8FeaW6NkTjksVc',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'list_founders_success',
			responsePayload: founders,
			responseCode: 200,
			responseMessage: 'Founders found',
			responseId: 'DbHpqxp40AmXPFHF',
		};
	} catch (error) {
		errorLogger('DbHpqxp40AmXPFHF', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'list_founders_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'DbHpqxp40AmXPFHF',
		};
	}
};

module.exports = {
	getFounderByEmail,
	createNewFounder,
	loginFounder,
	getFounderById,
	updateFounderProfile,
	listFounders,
};
