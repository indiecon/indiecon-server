const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InviteSchema = new Schema(
	{
		inviter: {
			type: Schema.Types.ObjectId,
			trim: true,
			required: true,
			ref: 'Founder',
		},
		invitee: {
			type: Schema.Types.ObjectId,
			trim: true,
			required: true,
			ref: 'Founder',
		},
		purposeOfMeeting: {
			type: String,
			trim: true,
			required: true,
		},
		additionalNote: {
			type: String,
			trim: true,
		},
		meetingDateAndTimeOne: {
			id: {
				type: String,
				trim: true,
				default: 'meetingDateAndTimeOne',
			},
			dateAndTime: {
				type: Date,
				required: true,
			},
		},
		meetingDateAndTimeTwo: {
			id: {
				type: String,
				trim: true,
				default: 'meetingDateAndTimeTwo',
			},
			dateAndTime: {
				type: Date,
				required: true,
			},
		},
		proposedMeetingDuration: {
			type: Number, // in minutes
			required: true,
		},
		inviteStatus: {
			type: String,
			enum: ['pending', 'accepted', 'rejected', 'canceled'],
			default: 'pending',
		},
		meetingAcceptedDateAndTime: {
			type: String, // id of the meeting date and time
			enum: ['meetingDateAndTimeOne', 'meetingDateAndTimeTwo'],
		},
		calendarLink: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Invite', InviteSchema);
