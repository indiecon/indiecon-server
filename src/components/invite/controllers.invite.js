const {
	createInvite,
	getInviteDetails,
	updateInviteDetails,
} = require('./dal.invite');

const createInviteController = async (req, res) => {
	const inviterId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';
	// meetingDateAndTimeOne and meetingDateAndTimeTwo numbers are in milliseconds since 1970 (Unix Epoch)
	// proposedMeetingDuration is numbers in minutes
	const {
		inviteeId,
		purposeOfMeeting,
		additionalNote,
		meetingDateAndTimeOne,
		meetingDateAndTimeTwo,
		proposedMeetingDuration,
	} = req.body;

	const createInviteResponse = await createInvite({
		inviterId,
		inviteeId,
		purposeOfMeeting,
		additionalNote,
		meetingDateAndTimeOne,
		meetingDateAndTimeTwo,
		proposedMeetingDuration,
	});

	return res
		.status(createInviteResponse.responseCode)
		.json(createInviteResponse);
};

const getInviteDetailsController = async (req, res) => {
	const founderId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';

	const inviteId = req.params
		? req.params.inviteId
			? req.params.inviteId
			: ''
		: '';

	const getInviteDetailsResponse = await getInviteDetails({
		founderId,
		inviteId,
	});

	if (
		getInviteDetailsResponse.responseType === 'error' ||
		getInviteDetailsResponse.responseCode === 404
	)
		return res
			.status(getInviteDetailsResponse.responseCode)
			.json(getInviteDetailsResponse);

	const { responsePayload } = getInviteDetailsResponse;

	const customPayload = {
		inviteDetails: {
			inviteId: responsePayload.id,
			purposeOfMeeting: responsePayload.purposeOfMeeting,
			additionalNote: responsePayload.additionalNote
				? responsePayload.additionalNote
				: '',
			meetingDateAndTimeOne: responsePayload.meetingDateAndTimeOne,
			meetingDateAndTimeTwo: responsePayload.meetingDateAndTimeTwo,
			proposedMeetingDuration: responsePayload.proposedMeetingDuration,
			inviteStatus: responsePayload.inviteStatus,
			meetingAcceptedDateAndTime: responsePayload.meetingAcceptedDateAndTime
				? responsePayload.meetingAcceptedDateAndTime
				: '',
			calendarLink: responsePayload.calendarLink
				? responsePayload.calendarLink
				: '',
			createdAt: responsePayload.createdAt,
		},
		inviterDetails: {
			inviterId: responsePayload.inviter.id,
			startupId: responsePayload.inviter.startupId.id,
			inviterFirstName: responsePayload.inviter.firstName,
			inviterLastName: responsePayload.inviter.lastName,
			startupName: responsePayload.inviter.startupId.name,
		},
		inviteeDetails: {
			inviteeId: responsePayload.invitee.id,
			startupId: responsePayload.invitee.startupId.id,
			inviteeFirstName: responsePayload.invitee.firstName,
			inviteeLastName: responsePayload.invitee.lastName,
			startupName: responsePayload.invitee.startupId.name,
		},
	};

	return res
		.status(getInviteDetailsResponse.responseCode)
		.json({ ...getInviteDetailsResponse, responsePayload: customPayload });
};

const updateInviteStatusController = async (req, res) => {
	const founderId = req.user
		? req.user.founderId
			? req.user.founderId
			: ''
		: '';

	const { inviteId, inviteStatus } = req.params;

	// send jwt, inviteId, acceptedTimeAndDateId if the invite is accepted
	// acceptedTimeAndDateId can be meetingDateAndTimeOne or meetingDateAndTimeTwo
	const { meetingAcceptedDateAndTimeId } = req.body;

	const updateInviteStatusResponse = await updateInviteDetails({
		founderId,
		inviteId: inviteId ? inviteId : '',
		inviteStatus: inviteStatus ? inviteStatus : '',
		meetingAcceptedDateAndTimeId: meetingAcceptedDateAndTimeId
			? meetingAcceptedDateAndTimeId
			: '',
	});

	if (
		updateInviteStatusResponse.responseType === 'error' ||
		updateInviteStatusResponse.responseCode === 404
	)
		return res
			.status(updateInviteStatusResponse.responseCode)
			.json(updateInviteStatusResponse);

	const { responsePayload } = updateInviteStatusResponse;

	const customPayload = {
		inviteDetails: {
			inviteId: responsePayload.id,
			purposeOfMeeting: responsePayload.purposeOfMeeting,
			additionalNote: responsePayload.additionalNote
				? responsePayload.additionalNote
				: '',
			meetingDateAndTimeOne: responsePayload.meetingDateAndTimeOne,
			meetingDateAndTimeTwo: responsePayload.meetingDateAndTimeTwo,
			proposedMeetingDuration: responsePayload.proposedMeetingDuration,
			inviteStatus: responsePayload.inviteStatus,
			meetingAcceptedDateAndTime: responsePayload.meetingAcceptedDateAndTime
				? responsePayload.meetingAcceptedDateAndTime
				: '',
			calendarLink: responsePayload.calendarLink
				? responsePayload.calendarLink
				: '',
			createdAt: responsePayload.createdAt,
		},
		inviterDetails: {
			inviterId: responsePayload.inviter.id,
		},
		inviteeDetails: {
			inviteeId: responsePayload.invitee.id,
		},
	};

	return res
		.status(updateInviteStatusResponse.responseCode)
		.json({ ...updateInviteStatusResponse, responsePayload: customPayload });
};

module.exports = {
	createInviteController,
	getInviteDetailsController,
	updateInviteStatusController,
};
