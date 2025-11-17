const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    last_guess_date: {
      type: Date,
      default: null,
    },
    last_correct_guess_date: {
      type: Date,
      default: null,
    },
    streak: {
      type: Number,
      default: 0,
    },
    daily_character_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisneyCharacter',
      default: null,
    },
    failed_attempts: {
      type: Number,
      default: 0,
    },
    hints_given: {
      type: Number,
      default: 0,
    },
    last_failed_guess_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserPoints', userPointsSchema);
