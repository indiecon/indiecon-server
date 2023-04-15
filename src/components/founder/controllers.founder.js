const {
	loginFounder,
	getFounderById,
	updateFounderProfile,
	listFounders,
} = require('./dal.founder');

const loginController = async (req, res) => {
	const email = req.body.email ? req.body.email : '';

	const loginResult = await loginFounder({ email });

	return res.status(loginResult.responseCode).json(loginResult);
};

const getFounderProfile = async (req, res) => {
	const founderId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';

	const founderResult = await getFounderById({
		founderId,
	});

	if (
		founderResult.responseType === 'error' ||
		founderResult.responseCode === 404
	)
		return res.status(founderResult.responseCode).json(founderResult);

	const founderData = founderResult.responsePayload;

	const newResponseObject = {
		...founderResult,
		responsePayload: {
			id: founderData.id,
			firstName: founderData.firstName,
			lastName: founderData.lastName,
			bio: founderData.bio,
			twitterUsername: founderData.twitterUsername,
			createdAt: founderData.createdAt,
			email: founderData.email,
		},
	};

	return res.status(founderResult.responseCode).json(newResponseObject);
};

const getFounderPublicProfile = async (req, res) => {
	const founderId = req.params
		? req.params.founderId
			? req.params.founderId
			: ''
		: '';

	const founderResult = await getFounderById({
		founderId,
	});

	if (
		founderResult.responseType === 'error' ||
		founderResult.responseCode === 404
	)
		return res.status(founderResult.responseCode).json(founderResult);

	const founderData = founderResult.responsePayload;

	if (founderData.areBothProfilesComplete === false) {
		return res.status(404).json({
			responseType: 'success',
			responseUniqueCode: 'no_founder_by_id',
			responsePayload: null,
			responseCode: 404,
			responseMessage: 'Founder not found',
			responseId: '391m4vsWdxtBYwH0',
		});
	}

	const newResponseObject = {
		...founderResult,
		responsePayload: {
			id: founderData.id,
			firstName: founderData.firstName,
			lastName: founderData.lastName,
			bio: founderData.bio,
			twitterUsername: founderData.twitterUsername,
			startupId: founderData.startupId.id,
			startupName: founderData.startupId.name,
		},
	};

	return res.status(founderResult.responseCode).json(newResponseObject);
};

const updateFounderProfileController = async (req, res) => {
	const founderId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';
	const { firstName, lastName, bio, twitterUsername } = req.body;

	const updateResult = await updateFounderProfile({
		founderId,
		firstName,
		lastName,
		bio,
		twitterUsername,
	});

	if (
		updateResult.responseType === 'error' ||
		updateResult.responseCode === 404
	)
		return res.status(updateResult.responseCode).json(updateResult);

	const founderData = updateResult.responsePayload;
	const newResponseObject = {
		...updateResult,
		responsePayload: {
			id: founderData.id,
			firstName: founderData.firstName,
			lastName: founderData.lastName,
			bio: founderData.bio,
			twitterUsername: founderData.twitterUsername,
			createdAt: founderData.createdAt,
			email: founderData.email,
		},
	};

	return res.status(updateResult.responseCode).json(newResponseObject);
};

const listFoundersController = async (req, res) => {
	const page = req.params ? (req.params.page ? req.params.page : 1) : 1;

	const listResult = await listFounders({ page });

	if (listResult.responseType === 'error' || listResult.responseCode === 404)
		return res.status(listResult.responseCode).json(listResult);

	const foundersDataArray = listResult.responsePayload;

	const cleanFoundersData = foundersDataArray.map((founder) => {
		return {
			id: founder.id,
			firstName: founder.firstName,
			lastName: founder.lastName,
			bio: founder.bio,
			twitterUsername: founder.twitterUsername,
			startupId: founder.startupId.id,
			startupName: founder.startupId.name,
		};
	});

	const newResponseObject = {
		...listResult,
		responsePayload: cleanFoundersData,
	};

	return res.status(listResult.responseCode).json(newResponseObject);
};

module.exports = {
	loginController,
	getFounderProfile,
	updateFounderProfileController,
	getFounderPublicProfile,
	listFoundersController,
};
