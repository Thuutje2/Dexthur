const mongoose = require('mongoose');

const disneyUserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DisneyUser', disneyUserSchema);