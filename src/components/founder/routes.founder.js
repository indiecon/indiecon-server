const router = require('express').Router();

const {
	loginController,
	getFounderProfile,
	updateFounderProfileController,
	getFounderPublicProfile,
	listFoundersController,
} = require('./controllers.founder');
const { verifyAuth } = require('../../middlewares/verifyAuth.middlewares');

// route to login user (create new or login existing user)
router.post('/auth', loginController);

// route to get profile of loggedin user
router.get('/profile', verifyAuth, getFounderProfile);

// route to update profile of loggedin user
router.patch('/update', verifyAuth, updateFounderProfileController);

// route to get profile of any user (public - no email or any private info) (no auth required)
router.get('/details/:founderId', getFounderPublicProfile);

// route to get list of founders (public - no email or any private info) (no auth required)
router.get('/list/:page', listFoundersController);

module.exports = router;
