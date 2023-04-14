require('dotenv').config();

const ENV = process.env.NODE_ENV;

const config = {
	development: {
		app: {
			port: process.env.PORT_DEV,
		},
		db: {
			uri: process.env.DEV_MONGODB_URI,
		},
	},
	staging: {
		app: {
			port: process.env.PORT_STAGING,
		},
		db: {
			uri: process.env.STAGING_MONGODB_URI,
		},
	},
	production: {
		app: {
			port: process.env.PORT_PROD,
		},
		db: {
			uri: process.env.PRODUCTION_MONGODB_URI,
		},
	},
};

// instead of exporting the config object, we export the config object based on the environment
module.exports = { config: config[ENV] };
