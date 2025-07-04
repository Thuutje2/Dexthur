const mongoose = require('mongoose');

const dbduserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
});

module.exports = mongoose.model('DBDUser', dbduserSchema);
