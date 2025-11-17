const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  achievements: [
    {
      id: String,
      unlockedAt: Date,
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
