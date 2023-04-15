const { updateStartupProfile } = require('./dal.startup');
const {
	getFounderById,
	getFounderAndStartupByStartupId,
	listFoundersAndStartups,
} = require('../founder/dal.founder');

const getStartupProfile = async (req, res) => {
	const founderId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';

	const startupDataResponse = await getFounderById({
		founderId,
	});

	if (
		startupDataResponse.responseType === 'error' ||
		startupDataResponse.responseCode === 404
	)
		return res
			.status(startupDataResponse.responseCode)
			.json(startupDataResponse);

	const startupData = startupDataResponse.responsePayload.startupId;

	const newStartupData = {
		id: startupData.id,
		name: startupData.name,
		description: startupData.description,
		mainLink: startupData.mainLink,
		socialLink: startupData.socialLink,
		industry: startupData.industry,
		createdAt: startupData.createdAt,
	};

	return res
		.status(startupDataResponse.responseCode)
		.json({ ...startupDataResponse, responsePayload: newStartupData });
};

const updateStartupProfileController = async (req, res) => {
	const { startupId, name, description, mainLink, socialLink, industry } =
		req.body;

	const founderId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';

	const founderDetailsResponse = await getFounderById({
		founderId,
	});

	if (
		founderDetailsResponse.responseType === 'error' ||
		founderDetailsResponse.responseCode === 404
	)
		return res
			.status(founderDetailsResponse.responseCode)
			.json(founderDetailsResponse);

	const founderDetails = founderDetailsResponse.responsePayload;

	if (founderDetails.startupId.id !== startupId)
		return res.status(403).json({
			responseType: 'error',
			responseUniqueCode: 'update_startup_profile_error',
			responsePayload: null,
			responseCode: 403,
			responseMessage: 'You are not authorized to perform this action.',
			responseId: 'GnUuJ9r5SOKiO4R9',
		});

	const { firstName, lastName, bio, twitterUsername } = founderDetails;

	const isFounderProfileComplete =
		firstName && lastName && bio && twitterUsername;

	const updateStartupProfileResponse = await updateStartupProfile({
		startupId,
		name,
		description,
		mainLink,
		socialLink,
		industry,
		founderId,
		isFounderProfileComplete: isFounderProfileComplete ? true : false,
	});

	if (
		updateStartupProfileResponse.responseType === 'error' ||
		updateStartupProfileResponse.responseCode === 404
	)
		return res
			.status(updateStartupProfileResponse.responseCode)
			.json(updateStartupProfileResponse);

	const startupData = updateStartupProfileResponse.responsePayload;

	const newStartupData = {
		id: startupData.id,
		name: startupData.name,
		description: startupData.description,
		mainLink: startupData.mainLink,
		socialLink: startupData.socialLink,
		industry: startupData.industry,
		createdAt: startupData.createdAt,
	};

	return res
		.status(updateStartupProfileResponse.responseCode)
		.json({ ...updateStartupProfileResponse, responsePayload: newStartupData });
};

const getPublicStartupProfile = async (req, res) => {
	const startupId = req.params
		? req.params.startupId
			? req.params.startupId
			: ''
		: '';

	const startupDataResponse = await getFounderAndStartupByStartupId({
		startupId,
	});

	if (
		startupDataResponse.responseType === 'error' ||
		startupDataResponse.responseCode === 404
	)
		return res
			.status(startupDataResponse.responseCode)
			.json(startupDataResponse);

	const data = startupDataResponse.responsePayload;

	const newData = {
		id: data.startupId.id,
		name: data.startupId.name,
		description: data.startupId.description,
		mainLink: data.startupId.mainLink,
		socialLink: data.startupId.socialLink,
		industry: data.startupId.industry,
		createdAt: data.startupId.createdAt,
		founderId: data.id,
		firstName: data.firstName,
		lastName: data.lastName,
	};

	return res
		.status(startupDataResponse.responseCode)
		.json({ ...startupDataResponse, responsePayload: newData });
};

const listStartupsController = async (req, res) => {
	const page = req.params ? (req.params.page ? req.params.page : 1) : 1;

	const listResult = await listFoundersAndStartups({ page });

	if (listResult.responseType === 'error' || listResult.responseCode === 404)
		return res.status(listResult.responseCode).json(listResult);

	const foundersAndStartupsDataArray = listResult.responsePayload;

	const cleanStartupsData = foundersAndStartupsDataArray.map((founder) => {
		return {
			founderId: founder.id,
			firstName: founder.firstName,
			lastName: founder.lastName,
			id: founder.startupId.id,
			startupName: founder.startupId.name,
			description: founder.startupId.description,
			mainLink: founder.startupId.mainLink,
			socialLink: founder.startupId.socialLink,
			industry: founder.startupId.industry,
			createdAt: founder.startupId.createdAt,
		};
	});

	const newResponseObject = {
		...listResult,
		responsePayload: cleanStartupsData,
	};

	return res.status(listResult.responseCode).json(newResponseObject);
};

module.exports = {
	getStartupProfile,
	getPublicStartupProfile,
	updateStartupProfileController,
	listStartupsController,
};
