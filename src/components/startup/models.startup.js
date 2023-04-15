const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StartupSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		mainLink: {
			type: String,
			trim: true,
		},
		socialLink: {
			type: String,
			trim: true,
		},
		industry: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Startup', StartupSchema);
