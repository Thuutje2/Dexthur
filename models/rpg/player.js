const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  name: String,
  role: String,
  level: Number,
  xp: Number,
  caveLore: [String],
  skills: {
    glow: Number,
    charm: Number,
    knowledge: Number
  },
  items: [String],
  reputation: Number,
  activeQuest: {
    id: String,
    choice: String
  },
  cooldowns: {
    explore: { type: Date, default: null }
  }
});

module.exports = mongoose.model("Player", playerSchema);