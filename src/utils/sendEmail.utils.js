const sgMail = require('@sendgrid/mail');

const { errorLogger } = require('./logErrors.utils');

// inviter: person who invites other founder
// invitee: person who is invited by other founder

// toInviter_InviteSent - Mail to inviter that invite has been sent
// toInvitee_InviteReceived - Mail to invitee that invite has been received
// toInviter_InviteRejectd - Mail to inviter that invitee has rejected the invite
// toInviter_InviteAccpeted - Mail to inviter that invitee has accepted the invite
// toInvitee_InviteCanceled - Mail to invitee that inviter has canceled the invite
// toInvitee_InviteAccepted - Confirmation mail to invitee that he has accepted

const templates = {
	toInviter_InviteSent: (
		inviterEmail,
		inviterFirstName,
		inviteeFirstName,
		inviteDetailsLink
	) => ({
		to: inviterEmail,
		from: 'indiecon.co@gmail.com',
		subject: 'Indiecon - Invite Sent!',
		text: 'Indiecon - Invite Sent!',
		html: `Hi ${inviterFirstName},
		<br/>
		<br/>
		This is the confirmation mail from <a href="https://indiecon.co">indiecon</a> regarding the invite you sent to <strong>${inviteeFirstName}</strong>.
		<br/>
		Find the details for this invite <a href=${inviteDetailsLink}>here</a>. If you feel like cancelling the invite, you can do so from the same link.
		<br/>
		We will inform you by mail when ${inviteeFirstName} accepts/rejects your invite.
		<br />
		<br />
		To report any issues, please reply to this email.
		<br/>
		<br/>
		Regards
		<br/>
		Aditya
		<br />
		Founder - Indiecon`,
	}),
	toInvitee_InviteReceived: (
		inviteeEmail,
		inviterFirstName,
		inviteeFirstName,
		inviteDetailsLink
	) => ({
		to: inviteeEmail,
		from: 'indiecon.co@gmail.com',
		subject: 'Indiecon - Invite Received!',
		text: 'Indiecon - Invite Received!',
		html: `Hi ${inviteeFirstName},
		<br/>
		<br/>
		This mail is from <a href="https://indiecon.co">indiecon</a> regarding the invite you received from <strong>${inviterFirstName}</strong>.
		<br/>
		Find the details for this invite <a href=${inviteDetailsLink}>here</a>. Please accept/reject the invite from the same link.
		<br/>
		We will inform you by mail if ${inviterFirstName} cancels the invite.
		<br />
		<br />
		To report any issues, please reply to this email.
		<br/>
		<br/>
		Regards
		<br/>
		Aditya
		<br />
		Founder - Indiecon`,
	}),
	toInviter_InviteRejected: (
		inviterEmail,
		inviterFirstName,
		inviteeFirstName,
		inviteDetailsLink
	) => ({
		to: inviterEmail,
		from: 'indiecon.co@gmail.com',
		subject: 'Indiecon - Invite Rejected!',
		text: 'Indiecon - Invite Rejected!',
		html: `Hi ${inviterFirstName},
		<br/>
		<br/>
		This is the mail from <a href="https://indiecon.co">indiecon</a> regarding the invite you sent to <strong>${inviteeFirstName}</strong>.
		<br/>
		We regret to inform you that ${inviteeFirstName} has rejected your invite. Find the details for this invite <a href=${inviteDetailsLink}>here</a>.
		<br/>
		<br />
		How about sending another invite to someone else? Visit <a href="https://indiecon.co">indiecon.co</a> to send another invite.
		<br />
		<br />
		To report any issues, please reply to this email.
		<br/>
		<br/>
		Regards
		<br/>
		Aditya
		<br />
		Founder - Indiecon`,
	}),
	toInvitee_InviteCanceled: (
		inviteeEmail,
		inviterFirstName,
		inviteeFirstName,
		inviteDetailsLink
	) => ({
		to: inviteeEmail,
		from: 'indiecon.co@gmail.com',
		subject: 'Indiecon - Invite Canceled!',
		text: 'Indiecon - Invite Canceled!',
		html: `Hi ${inviteeFirstName},
		<br/>
		<br/>
		This is the mail from <a href="https://indiecon.co">indiecon</a> regarding the invite you received from <strong>${inviterFirstName}</strong>.
		<br/>
		We regret to inform you that ${inviterFirstName} has canceled the invite. Find the details for this invite <a href=${inviteDetailsLink}>here</a>.
		<br/>
		<br />
		How about sending another invite to someone else? Visit <a href="https://indiecon.co">indiecon.co</a> to send another invite.
		<br />
		<br />
		To report any issues, please reply to this email.
		<br/>
		<br/>
		Regards
		<br/>
		Aditya
		<br />
		Founder - Indiecon`,
	}),
	toInvitee_InviteAccepted: (
		inviteeEmail,
		inviterFirstName,
		inviteeFirstName,
		inviteDetailsLink
	) => ({
		to: inviteeEmail,
		from: 'indiecon.co@gmail.com',
		subject: 'Indiecon - Invite Accepted!',
		text: 'Indiecon - Invite Accepted!',
		html: `Hi ${inviteeFirstName},
		<br/>
		<br/>
		This is the mail from <a href="https://indiecon.co">indiecon</a> regarding the invite you received from <strong>${inviterFirstName}</strong>.
		<br/>
		We are excited to inform you that your meeting has been scheduled with ${inviterFirstName}. Find the details for this invite <a href=${inviteDetailsLink}>here</a>.
		<br/>
		<br />
		You can also check your calendar for the meeting details (time, date, link, etc.)
		<br />
		<br />
		To report any issues, please reply to this email.
		<br/>
		<br/>
		Regards
		<br/>	
		Aditya
		<br />
		Founder - Indiecon`,
	}),
	toInviter_InviteAccepted: (
		inviterEmail,
		inviterFirstName,
		inviteeFirstName,
		inviteDetailsLink
	) => ({
		to: inviterEmail,
		from: 'indiecon.co@gmail.com',
		subject: 'Indiecon - Invite Accepted!',
		text: 'Indiecon - Invite Accepted!',
		html: `Hi ${inviterFirstName},
		<br/>
		<br/>
		This is the mail from <a href="https://indiecon.co">indiecon</a> regarding the invite you sent to <strong>${inviteeFirstName}</strong>.
		<br/>
		We are excited to inform you that your meeting has been scheduled with ${inviteeFirstName}. Find the details for this invite <a href=${inviteDetailsLink}>here</a>.
		<br/>
		<br />
		You can also check your calendar for the meeting details (time, date, link, etc.)
		<br />
		<br />
		To report any issues, please reply to this email.
		<br/>
		<br/>
		Regards
		<br/>
		Aditya
		<br />
		Founder - Indiecon`,
	}),
};

let isApiKeySet = false;
const sendEmailService = async (msg) => {
	try {
		// set api key only once for the entire app lifecycle
		if (!isApiKeySet) {
			sgMail.setApiKey(process.env.SENDGRID_API_KEY);
			isApiKeySet = true;
		}

		const response = await sgMail.send(msg);

		if (
			!response ||
			!response[0] ||
			!response[0].statusCode ||
			response[0].statusCode !== 202
		) {
			return {
				responseType: 'error',
				responseUniqueCode: 'sendEmail_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'k43kkQ5eGR9NsBkp',
			};
		}

		return {
			responseType: 'success',
			responseUniqueCode: 'sendEmail_success',
			responsePayload: null,
			responseCode: 200,
			responseMessage: 'Email sent successfully',
			responseId: 'BpZ3g9kPDFwhFIbm',
		};
	} catch (err) {
		errorLogger('2e0fBNCzhoFnwJOZ', err);
		return {
			responseType: 'error',
			responseUniqueCode: 'sendEmail_error',
			responsePayload: null,
			responseCode: 400,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: '2e0fBNCzhoFnwJOZ',
		};
	}
};

const sendEmail = async (context) => {
	try {
		const { template } = context;

		// check if template exists in templates object
		if (!template || !templates[template]) {
			return {
				responseType: 'error',
				responseUniqueCode: 'sendEmail_error',
				responsePayload: null,
				responseCode: 400,
				responseMessage:
					'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
				responseId: 'iDJeUOdf1HSL6FdR',
			};
		}

		if (
			template === 'toInviter_InviteSent' ||
			template === 'toInviter_InviteRejected' ||
			template === 'toInviter_InviteAccepted'
		) {
			const {
				inviterEmail,
				inviterFirstName,
				inviteeFirstName,
				inviteDetailsLink,
			} = context;

			if (
				!inviterEmail ||
				!inviterFirstName ||
				!inviteeFirstName ||
				!inviteDetailsLink
			) {
				return {
					responseType: 'error',
					responseUniqueCode: 'sendEmail_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage:
						'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
					responseId: 'iPT5Nw0hatD67g8d',
				};
			}

			const msg = templates[template](
				inviterEmail,
				inviterFirstName,
				inviteeFirstName,
				inviteDetailsLink
			);
			const response = await sendEmailService(msg);
			return response;
		}

		if (
			template === 'toInvitee_InviteReceived' ||
			template === 'toInvitee_InviteCanceled' ||
			template === 'toInvitee_InviteAccepted'
		) {
			const {
				inviteeEmail,
				inviterFirstName,
				inviteeFirstName,
				inviteDetailsLink,
			} = context;

			if (
				!inviteeEmail ||
				!inviterFirstName ||
				!inviteeFirstName ||
				!inviteDetailsLink
			) {
				return {
					responseType: 'error',
					responseUniqueCode: 'sendEmail_error',
					responsePayload: null,
					responseCode: 400,
					responseMessage:
						'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
					responseId: 'Fv6nPIIHRGsFhWYF',
				};
			}

			const msg = templates[template](
				inviteeEmail,
				inviterFirstName,
				inviteeFirstName,
				inviteDetailsLink
			);
			const response = await sendEmailService(msg);
			return response;
		}
	} catch (error) {
		errorLogger('xAAUk36ELcmCkBYv', error);
		return {
			responseType: 'error',
			responseUniqueCode: 'sendEmail_error',
			responsePayload: null,
			responseCode: 500,
			responseMessage:
				'Internal error. Please refresh the page and try again. If error persists, please contact the team.',
			responseId: 'xAAUk36ELcmCkBYv',
		};
	}
};

module.exports = sendEmail;
