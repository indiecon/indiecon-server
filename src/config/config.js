require('dotenv').config();

const ENV = process.env.NODE_ENV;

// OpenAI API Key and Org ID same for dev and staging. Different for production

const config = {
	development: {
		app: {
			port: 8080,
		},
		db: {
			uri: process.env.DEV_MONGODB_URI,
		},
	},
	staging: {
		app: {
			port: 6969,
		},
		db: {
			uri: process.env.STAGING_MONGODB_URI,
		},
	},
	production: {
		app: {
			port: 8081,
		},
		db: {
			uri: process.env.PRODUCTION_MONGODB_URI,
		},
	},
};

// instead of exporting the config object, we export the config object based on the environment
module.exports = config[ENV];
