const axios = require('axios');

const InviteModel = require('./models.invite');
const { errorLogger } = require('../../utils/logErrors.utils');
const { getFounderById } = require('../founder/dal.founder');
const sendEmail = require('../../utils/sendEmail.utils');
const { generateJWT } = require('../../utils/generateJWT.utils');

const createInvite = async (context) => {
	let {
		inviterId,
		inviteeId,
		purposeOfMeeting,
		additionalNote,
		meetingDateAndTimeOne,
		meetingDateAndTimeTwo,
		proposedMeetingDuration,
	} = context;

	try {
		if (
			!inviterId ||
			!inviterId.trim() ||
			!inviteeId ||
			!inviteeId.trim() ||
			!purposeOfMeeting ||
			!purposeOfMeeting.trim() ||
			!meetingDateAndTimeOne ||
			!meetingDateAndTimeTwo ||
			!proposedMeetingDuration
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: 'Missing required data',
				responseId: 'ZcmgvG3t2iF7ncVr',
			};
		}

		inviterId = inviterId.trim();
		inviteeId = inviteeId.trim();
		purposeOfMeeting = purposeOfMeeting.trim();
		additionalNote = additionalNote ? additionalNote.trim() : '';

		if (purposeOfMeeting.length > 100 || purposeOfMeeting.length < 20) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Purpose of meeting must be between 20 and 100 characters',
				responseId: 'ESE85Co9RQGvoAYN',
			};
		}

		if (additionalNote) {
			if (additionalNote.length > 200 || additionalNote.length < 20) {
				return {
					responseType: 'error',
					responseUniqueCode: 'createInvite_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage:
						'Additional note must be between 20 and 200 characters',
					responseId: 'AbOQJ7mO6W6nOPg7',
				};
			}
		}

		if (inviterId === inviteeId) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: "You can't invite yourself",
				responseId: 'uBPQNQcuFrdhFxlz',
			};
		}

		// check if the inviter and invitee profiles are complete
		const inviterProfile = await getFounderById({ founderId: inviterId });
		const inviteeProfile = await getFounderById({ founderId: inviteeId });

		if (
			inviterProfile.responseType === 'error' ||
			inviteeProfile.responseType === 'error' ||
			inviterProfile.responseCode === 404 ||
			inviteeProfile.responseCode === 404
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Invalid inviter or invitee. Please refresh, and try again. If error persists, please contact the team.',
				responseId: 'uBPQNQcuFrdhFxlz',
			};
		}

		if (
			inviterProfile.responsePayload.areBothProfilesComplete === false ||
			inviteeProfile.responsePayload.areBothProfilesComplete === false
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: 'Profiles of inviter or invitee are incomplete',
				responseId: 'Qg9ZaLPZe1BIlw89',
			};
		}

		// meetingDateAndTimeOne and meetingDateAndTimeTwo numbers are in milliseconds since 1970 (Unix Epoch)
		// proposedMeetingDuration is numbers in minutes

		// meeting time one and meeting time two can't be the same and should be in the future and not in the past and also can't be from 1 month in the future
		const meetingDateAndTimeOneDate = new Date(meetingDateAndTimeOne);
		const meetingDateAndTimeTwoDate = new Date(meetingDateAndTimeTwo);
		const currentDate = new Date();
		const oneMonthFromNow = new Date();
		oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

		if (
			meetingDateAndTimeOneDate.getTime() < currentDate.getTime() ||
			meetingDateAndTimeTwoDate.getTime() < currentDate.getTime() ||
			meetingDateAndTimeOneDate.getTime() > oneMonthFromNow.getTime() ||
			meetingDateAndTimeTwoDate.getTime() > oneMonthFromNow.getTime()
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Invalid meeting date and time. Meetings can only be scheduled for the future and not more than 1 month from now.',
				responseId: 'S3lqeX82FhWYisHD',
			};
		}

		// meeting should be scheduled atleast 30 mins from current time
		const thirtyMinutesFromNow = new Date();
		thirtyMinutesFromNow.setMinutes(thirtyMinutesFromNow.getMinutes() + 30);

		if (
			meetingDateAndTimeOneDate.getTime() < thirtyMinutesFromNow.getTime() ||
			meetingDateAndTimeTwoDate.getTime() < thirtyMinutesFromNow.getTime()
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Meeting should be scheduled atleast 30 minutes from now',
				responseId: 'veFzeWAKLnuzJZhy',
			};
		}

		if (
			meetingDateAndTimeOneDate.getTime() ===
			meetingDateAndTimeTwoDate.getTime()
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: 'Both meeting times can not be the same',
				responseId: 'RSoGMQ5IAiWuO5cG',
			};
		}

		// proposed meeting duration can't be less than 15 minutes and can't be more than 120 minutes
		if (proposedMeetingDuration < 15 || proposedMeetingDuration > 120) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Invalid meeting duration. Meeting duration can not be less than 15 minutes and can not be more than 120 minutes',
				responseId: 'XQm0hQjmrlwZJPVG',
			};
		}

		// check if the inviter and invitee already have a meeting in the future, with invite status of pending or accepted. The inviter and invitee can't have more than 1 meeting in the future with invite status of pending or accepted

		const inviterInviteeMeeting = await InviteModel.find({
			$or: [
				{
					inviter: inviterId,
					invitee: inviteeId,
					inviteStatus: {
						$in: ['pending', 'accepted'],
					},
					$or: [
						{
							'meetingDateAndTimeOne.dateAndTime': {
								$gte: currentDate,
							},
						},
						{
							'meetingDateAndTimeTwo.dateAndTime': {
								$gte: currentDate,
							},
						},
					],
				},
				{
					inviter: inviteeId,
					invitee: inviterId,
					inviteStatus: {
						$in: ['pending', 'accepted'],
					},
					$or: [
						{
							'meetingDateAndTimeOne.dateAndTime': {
								$gte: currentDate,
							},
						},
						{
							'meetingDateAndTimeTwo.dateAndTime': {
								$gte: currentDate,
							},
						},
					],
				},
			],
		});

		if (inviterInviteeMeeting.length > 0) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'You already have a meeting scheduled with this person. Please check your calendar or email.',
				responseId: '9tIJGlnDWj4YjJiu',
			};
		}

		// check if inviter has exceeded the 5 number of invites limit in the last 24 hours
		const invitesSentInLast24Hours = await InviteModel.find({
			inviter: inviterId,
			createdAt: {
				$gte: new Date(new Date().setDate(new Date().getDate() - 1)),
			},
		});

		if (!invitesSentInLast24Hours) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'UYkkcOXYbgiYUGXB',
			};
		}

		if (invitesSentInLast24Hours.length >= 5) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'You have exceeded the number of invites you can send in a day. Please try again tomorrow.',
				responseId: 'qyDTMeHJ7rOPLHpM',
			};
		}

		// save details in db
		const invite = new InviteModel({
			inviter: inviterId,
			invitee: inviteeId,
			purposeOfMeeting,
			additionalNote,
			meetingDateAndTimeOne: {
				id: 'meetingDateAndTimeOne',
				dateAndTime: meetingDateAndTimeOneDate,
			},
			meetingDateAndTimeTwo: {
				id: 'meetingDateAndTimeTwo',
				dateAndTime: meetingDateAndTimeTwoDate,
			},
			proposedMeetingDuration,
			inviteStatus: 'pending',
		});

		const savedInvite = await invite.save();

		if (!savedInvite) {
			return {
				responseType: 'error',
				responseUniqueCode: 'createInvite_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'kgmqVs1flR7P1s0m',
			};
		}

		// send email to invitee that invite is received
		const inviteeJwtTokenResponse = await generateJWT({ founderId: inviteeId });
		if (inviteeJwtTokenResponse.responseType === 'error')
			return inviteeJwtTokenResponse;

		const inviteeEmailResponse = await sendEmail({
			template: 'toInvitee_InviteReceived',
			inviteeEmail: inviteeProfile.responsePayload.email,
			inviterFirstName: inviterProfile.responsePayload.firstName,
			inviteeFirstName: inviteeProfile.responsePayload.firstName,
			inviteDetailsLink: `${process.env.FRONTEND_URL}/invite/${savedInvite.id}?token=${inviteeJwtTokenResponse.responsePayload}`,
		});

		if (inviteeEmailResponse.responseType === 'error') {
			// delete invite from db
			await InviteModel.findByIdAndDelete(savedInvite.id);

			return inviteeEmailResponse;
		}

		// send email to inviter
		const inviterJwtTokenResponse = await generateJWT({ founderId: inviterId });
		if (inviterJwtTokenResponse.responseType === 'error')
			return inviterJwtTokenResponse;

		const inviterEmailResponse = await sendEmail({
			template: 'toInviter_InviteSent',
			inviterEmail: inviterProfile.responsePayload.email,
			inviterFirstName: inviterProfile.responsePayload.firstName,
			inviteeFirstName: inviteeProfile.responsePayload.firstName,
			inviteDetailsLink: `${process.env.FRONTEND_URL}/invite/${savedInvite.id}?token=${inviterJwtTokenResponse.responsePayload}`,
		});
		if (inviterEmailResponse.responseType === 'error') {
			// delete invite from db
			await InviteModel.findByIdAndDelete(savedInvite.id);

			return inviterEmailResponse;
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'createInvite_success',
			responsePayload: null,
			responseCode: 201,
			responseMessage:
				'Invite created successfully. Please check your email for more details.',
			responseId: '1UrVzgrOuEpWrRHc',
		};
	} catch (error) {
		errorLogger('TdWS21hHA15Q78rn', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'createInvite_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'TdWS21hHA15Q78rn',
		};
	}
};

const getInviteDetails = async (context) => {
	try {
		if (
			!context ||
			!context.founderId ||
			!context.founderId.trim() ||
			!context.inviteId ||
			!context.inviteId.trim()
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'getInviteDetails_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'vJsH7Ob9bBKIYmHo',
			};
		}

		let { founderId, inviteId } = context;
		founderId = founderId.trim();
		inviteId = inviteId.trim();

		// get the invite details from db and populate the inviter and invitee details and recurively populate the founder with startupId
		const foundInvite = await InviteModel.findById(inviteId)
			.populate({
				path: 'inviter',
				populate: {
					path: 'startupId',
				},
			})
			.populate({
				path: 'invitee',
				populate: {
					path: 'startupId',
				},
			});

		if (!foundInvite) {
			return {
				responseType: 'success',
				responseUniqueCode: 'getInviteDetails_success',
				responsePayload: null,
				responseCode: 404,
				responseMessage: 'Invite not found.',
				responseId: 'zXhbRlqNpfffe2VG',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'getInviteDetails_success',
			responsePayload: foundInvite,
			responseCode: 200,
			responseMessage: 'Invite details fetched successfully.',
			responseId: 'BxlNvnjVb2q40TWM',
		};
	} catch (error) {
		errorLogger('fWcvKfSgZd2Chw5f', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'getInviteDetails_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'fWcvKfSgZd2Chw5f',
		};
	}
};

const updateInviteDetails = async (context) => {
	try {
		if (
			!context ||
			!context.inviteId ||
			!context.inviteId.trim() ||
			!context.founderId ||
			!context.founderId.trim() ||
			!context.inviteStatus ||
			!context.inviteStatus.trim()
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'updateInviteDetails_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'gS2Gy4hassxsZkLS',
			};
		}

		let { inviteId, founderId, inviteStatus } = context;
		inviteId = inviteId.trim();
		founderId = founderId.trim();
		inviteStatus = inviteStatus.trim();

		if (
			inviteStatus !== 'accepted' &&
			inviteStatus !== 'rejected' &&
			inviteStatus !== 'canceled'
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'updateInviteDetails_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: 'Invalid invite status.',
				responseId: 'MtMad4j8SE60KM7H',
			};
		}

		const googleCode = context.googleCode ? context.googleCode.trim() : '';
		const meetingAcceptedDateAndTimeId = context.meetingAcceptedDateAndTimeId
			? context.meetingAcceptedDateAndTimeId.trim()
			: '';

		if (inviteStatus === 'accepted') {
			if (
				!googleCode ||
				!meetingAcceptedDateAndTimeId ||
				(meetingAcceptedDateAndTimeId !== 'meetingDateAndTimeOne' &&
					meetingAcceptedDateAndTimeId !== 'meetingDateAndTimeTwo')
			) {
				return {
					responseType: 'error',
					responseUniqueCode: 'updateInviteDetails_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage: 'Invalid invite status.',
					responseId: 'bqXfutV6NQPJ9Gun',
				};
			}
		}

		const inviteDetailsResponse = await getInviteDetails({
			inviteId,
			founderId,
		});

		if (
			inviteDetailsResponse.responseType === 'error' ||
			inviteDetailsResponse.responseCode === 404
		)
			return inviteDetailsResponse;

		const foundInvite = inviteDetailsResponse.responsePayload;
		if (
			founderId !== foundInvite.inviter.id &&
			founderId !== foundInvite.invitee.id
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'updateInviteDetails_error',
				responsePayload: null,
				responseCode: 401,
				responseMessage: 'Unauthorized.',
				responseId: '8Hwdhpa28szlzhAx',
			};
		}

		if (founderId === foundInvite.inviter.id) {
			if (inviteStatus === 'accepted' || inviteStatus === 'rejected') {
				return {
					responseType: 'error',
					responseUniqueCode: 'updateInviteDetails_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage:
						'You cannot accept/reject this invite as you are the inviter.',
					responseId: '49sByVbGQAzXe0uj',
				};
			}
		}

		if (founderId === foundInvite.invitee.id) {
			if (inviteStatus === 'canceled') {
				return {
					responseType: 'error',
					responseUniqueCode: 'updateInviteDetails_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage:
						'You cannot cancel this invite as you are the invitee.',
					responseId: 'baqSU06vpNax2Ed9',
				};
			}
		}

		// if current time is greater than meetingDateAndTimeOne.dateAndTime, and meetingDateAndTimeTwo.dateAndTime, then return error
		const currentTime = new Date();
		if (
			currentTime > foundInvite.meetingDateAndTimeOne.dateAndTime &&
			currentTime > foundInvite.meetingDateAndTimeTwo.dateAndTime
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'updateInviteDetails_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'You cannot accept/reject/cancel this invite as the meeting date and time has passed.',
				responseId: 'ZB1IW0kjSbaIrfDD',
			};
		}

		if (foundInvite.inviteStatus === inviteStatus) {
			return {
				responseType: 'error',
				responseUniqueCode: 'updateInviteDetails_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: `Invite already ${inviteStatus}.`,
				responseId: 'mE7YWgIGrzPDkwWS',
			};
		}

		// if inviteStatus is currently pending, that means the invitee/inviter has not accepted/rejected/canceled the invite yet. So, we can update the inviteStatus. But otherwise, we can't update the inviteStatus.
		if (
			foundInvite.inviteStatus !== 'pending' &&
			inviteStatus !== foundInvite.inviteStatus
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'updateInviteDetails_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage: `Invite already ${foundInvite.inviteStatus}.`,
				responseId: 'uqaIEgu9TTYeh7fb',
			};
		}

		if (inviteStatus === 'canceled' || inviteStatus === 'rejected') {
			// send respective emails
			if (inviteStatus === 'canceled') {
				// send email to invitee that invite has been cancelled by inviter
				const inviteeJwtTokenResponse = await generateJWT({
					founderId: foundInvite.invitee.id,
				});

				if (inviteeJwtTokenResponse.responseType === 'error')
					return inviteeJwtTokenResponse;

				const inviteeJwtToken = inviteeJwtTokenResponse.responsePayload;

				const inviteeEmailResponse = await sendEmail({
					template: 'toInvitee_InviteCanceled',
					inviteeEmail: foundInvite.invitee.email,
					inviterFirstName: foundInvite.inviter.firstName,
					inviteeFirstName: foundInvite.invitee.firstName,
					inviteDetailsLink: `${process.env.FRONTEND_URL}/invite/${inviteId}?token=${inviteeJwtToken}`,
				});

				if (inviteeEmailResponse.responseType === 'error')
					return inviteeEmailResponse;
			}

			if (inviteStatus === 'rejected') {
				// send email to inviter that invite has been rejected by invitee
				const inviterJwtTokenResponse = await generateJWT({
					founderId: foundInvite.inviter.id,
				});

				if (inviterJwtTokenResponse.responseType === 'error')
					return inviterJwtTokenResponse;

				const inviterJwtToken = inviterJwtTokenResponse.responsePayload;

				const inviterEmailResponse = await sendEmail({
					template: 'toInviter_InviteRejected',
					inviterEmail: foundInvite.inviter.email,
					inviterFirstName: foundInvite.inviter.firstName,
					inviteeFirstName: foundInvite.invitee.firstName,
					inviteDetailsLink: `${process.env.FRONTEND_URL}/invite/${inviteId}?token=${inviterJwtToken}`,
				});

				if (inviterEmailResponse.responseType === 'error')
					return inviterEmailResponse;
			}

			// update the invite status to canceled or rejected in db
			const updatedInvite = await InviteModel.findByIdAndUpdate(
				inviteId,
				{
					inviteStatus,
				},
				{ new: true }
			);

			if (!updatedInvite) {
				return {
					responseType: 'error',
					responseUniqueCode: 'updateInviteDetails_error',
					responsePayload: null,
					responseCode: 500,
					responseMessage:
						'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
					responseId: 'IzGUJCLfkKdsbIZw',
				};
			}

			return {
				responseType: 'success',
				responseUniqueCode: 'updateInviteDetails_success',
				responsePayload: updatedInvite,
				responseCode: 200,
				responseMessage: `Invite ${inviteStatus} successfully.`,
				responseId: 'g4k8JxhxPMv761q8',
			};
		}

		if (inviteStatus === 'accepted') {
			// check if current time is less than the accepted time. If no, return error
			const currentTime = new Date();
			const acceptedDateAndTime =
				meetingAcceptedDateAndTimeId === 'meetingDateAndTimeOne'
					? foundInvite.meetingDateAndTimeOne.dateAndTime
					: foundInvite.meetingDateAndTimeTwo.dateAndTime;

			if (currentTime > acceptedDateAndTime) {
				return {
					responseType: 'error',
					responseUniqueCode: 'updateInviteDetails_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage: `You cannot accept this invite as the meeting time has already passed.`,
					responseId: 'UCP6xDTxrb9dZsVX',
				};
			}

			const scheduleMeetingResponse = await axios.post(
				`${process.env.BACKEND_URL}/api/v1/google/schedule`,
				{
					code: googleCode,
					inviterFirstName: foundInvite.inviter.firstName,
					meetStartDateTimeInUTC: acceptedDateAndTime,
					meetEndDateTimeInUTC: new Date(
						acceptedDateAndTime.getTime() +
							Number(foundInvite.proposedMeetingDuration) * 60000
					),
					inviterEmail: foundInvite.inviter.email,
					inviteeEmail: foundInvite.invitee.email,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (scheduleMeetingResponse.data.responseType === 'error')
				return scheduleMeetingResponse.data;

			// send emails to both invitee and inviter

			const inviteeJwtTokenResponse = await generateJWT({
				founderId: foundInvite.invitee.id,
			});

			if (inviteeJwtTokenResponse.responseType === 'error')
				return inviteeJwtTokenResponse;

			const inviteeJwtToken = inviteeJwtTokenResponse.responsePayload;

			const inviteeEmailResponse = await sendEmail({
				template: 'toInvitee_InviteAccepted',
				inviteeEmail: foundInvite.invitee.email,
				inviterFirstName: foundInvite.inviter.firstName,
				inviteeFirstName: foundInvite.invitee.firstName,
				inviteDetailsLink: `${process.env.FRONTEND_URL}/invite/${inviteId}?token=${inviteeJwtToken}`,
			});

			if (inviteeEmailResponse.responseType === 'error')
				return inviteeEmailResponse;

			const inviterJwtTokenResponse = await generateJWT({
				founderId: foundInvite.inviter.id,
			});

			if (inviterJwtTokenResponse.responseType === 'error')
				return inviterJwtTokenResponse;

			const inviterJwtToken = inviterJwtTokenResponse.responsePayload;

			const inviterEmailResponse = await sendEmail({
				template: 'toInviter_InviteAccepted',
				inviterEmail: foundInvite.inviter.email,
				inviterFirstName: foundInvite.inviter.firstName,
				inviteeFirstName: foundInvite.invitee.firstName,
				inviteDetailsLink: `${process.env.FRONTEND_URL}/invite/${inviteId}?token=${inviterJwtToken}`,
			});

			if (inviterEmailResponse.responseType === 'error')
				return inviterEmailResponse;

			// get meeting link and update the db with status, meeting link, and meeting date and time, meeting data
			const response = scheduleMeetingResponse.data.responsePayload;

			const updatedInvite = await InviteModel.findByIdAndUpdate(
				inviteId,
				{
					inviteStatus: 'accepted',
					meetingLink: response.hangoutLink,
					meetingAcceptedDateAndTime: meetingAcceptedDateAndTimeId,
					meetingData: {
						start: response.start,
						end: response.end,
					},
				},
				{ new: true }
			);

			if (!updatedInvite)
				return {
					responseType: 'error',
					responseUniqueCode: 'updateInviteDetails_error',
					responsePayload: null,
					responseCode: 500,
					responseMessage:
						'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
					responseId: 'L5A6bQQKWTxedmS2',
				};

			return {
				responseType: 'success',
				responseUniqueCode: 'updateInviteDetails_success',
				responsePayload: updatedInvite,
				responseCode: 200,
				responseMessage: `Invite ${inviteStatus} successfully.`,
				responseId: 'D3eQbO1TQfoESsT9',
			};
		}
	} catch (error) {
		errorLogger('cSk2qjKwYAQrFtpq', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'updateInviteDetails_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'cSk2qjKwYAQrFtpq',
		};
	}
};

module.exports = {
	createInvite,
	getInviteDetails,
	updateInviteDetails,
};
