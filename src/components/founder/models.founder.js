const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FounderSchema = new Schema(
	{
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			lowercase: true,
		},
		twitterUsername: {
			type: String,
			trim: true,
			lowercase: true,
		},
		bio: {
			type: String,
			trim: true,
		},
		startupId: {
			type: Schema.Types.ObjectId,
			trim: true,
			required: true,
			ref: 'Startup',
		},
		// gets updated if startup profile is changed or user profile is changed
		areBothProfilesComplete: {
			type: Boolean,
			default: false,
		},
		// isProfileLocked: {
		// 	type: Boolean,
		// 	default: false,
		// },
		// profileLockedTill: {
		// 	type: Date,
		// },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Founder', FounderSchema);
