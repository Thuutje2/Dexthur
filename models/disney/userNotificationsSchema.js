const mongoose = require('mongoose');

const userNotificationsSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    notifications_disney_guess: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserNotifications', userNotificationsSchema);
