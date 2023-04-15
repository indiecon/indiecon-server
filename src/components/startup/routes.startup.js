const router = require('express').Router();

// route to get profile of loggedin user's startup
router.get('/profile');

// route to update profile of loggedin user's startup
router.post('/update');

// route to get startup's profile of any user by startupId (public - no email or any private info) (no auth required)
router.get('/details/:startupId');

// route to get list of founders' startups (public - no email or any private info) (no auth required)
router.get('/list/:page');

module.exports = router;
