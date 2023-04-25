// 9. If the meeting is canceled by the inviter, send an email to invitee and the inviter with the cancellation details, also update the invite status to canceled
// 10. If the meeting is rejected by invitee, send an email to inviter with the rejection details, also update the invite status to rejected
// 11. If the meeting is accepted by invitee, send an email to inviter and the invitee with the acceptance details and schedule the meeting in the calendar, also update the invite status to accepted and add meeting link and meeting Data, and meeting Accepted Date and time.

const {
	createInviteController,
	getInviteDetailsController,
	updateInviteStatusController,
} = require('./controllers.invite');

const { verifyAuth } = require('../../middlewares/verifyAuth.middlewares');

const router = require('express').Router();

// route to create a new invite
router.post('/create', verifyAuth, createInviteController);

router.patch(
	'/status/:inviteId/:inviteStatus',
	verifyAuth,
	updateInviteStatusController
);

router.get('/details/:inviteId', verifyAuth, getInviteDetailsController);

module.exports = router;
