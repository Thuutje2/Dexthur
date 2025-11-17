const mongoose = require('mongoose');

const levelRoleSchema = new mongoose.Schema({
  level: Number,
  roleId: String,
});

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  levelRoles: [levelRoleSchema],
  achievementChannelId: { type: String, default: null },
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
