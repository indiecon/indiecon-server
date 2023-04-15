const router = require('express').Router();

const { verifyAuth } = require('../../middlewares/verifyAuth.middlewares');
const {
	getStartupProfile,
	getPublicStartupProfile,
	updateStartupProfileController,
	listStartupsController,
} = require('./controllers.startup');

// route to get profile of loggedin user's startup
router.get('/profile', verifyAuth, getStartupProfile);

// route to update profile of loggedin user's startup
router.patch('/update', verifyAuth, updateStartupProfileController);

// route to get startup's profile of any user by startupId (public - no email or any private info) (no auth required)
router.get('/details/:startupId', getPublicStartupProfile);

// route to get list of founders' startups (public - no email or any private info) (no auth required)
router.get('/list/:page', listStartupsController);

module.exports = router;
