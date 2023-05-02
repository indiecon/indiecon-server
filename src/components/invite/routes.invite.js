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
