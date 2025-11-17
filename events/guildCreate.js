const { Events } = require('discord.js');
const GuildSettings = require('../models/setup/GuildSettings'); // Assuming you have a GuildSettings model

const roleNames = [
  'Trial Rookie',
  'Perk Pupil',
  'Skill Check Survivor',
  'Chase Champion',
  'Hook Dodger',
  'Totem Tracker',
  'Escape Artist',
  'Fog Wanderer',
  'Perk Professor',
  "Entity's Favorite",
];

const pastelColors = [
  0xffc1cc, // lichtroze
  0xaec6cf, // pastelblauw
  0xfff1b5, // lichtgeel
  0xb0e0e6, // poederblauw
  0xd5e8d4, // mintgroen
  0xfccde5, // zachtroze
  0xc1f0f6, // pastel aqua
  0xfdb9c8, // roze zalm
  0xe0bbe4, // lila
  0xffdab9, // perzik
];

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild) {
    console.log(`Bot joined guild: ${guild.name} (ID: ${guild.id})`);

    // Check if bot has permission to manage roles
    if (!guild.members.me.permissions.has('ManageRoles')) {
      console.error(
        `Bot doesn't have ManageRoles permission in guild ${guild.name}`
      );
      return;
    }

    const createdRoles = [];

    for (const [index, name] of roleNames.entries()) {
      try {
        // Check if role already exists
        const existingRole = guild.roles.cache.find(
          (role) => role.name === name
        );
        if (existingRole) {
          console.log(`Role "${name}" already exists in guild ${guild.name}`);
          continue;
        }

        const role = await guild.roles.create({
          name,
          color: pastelColors[index % pastelColors.length], // Wikkel rond als het er meer zijn
          reason: 'Level role for quiz bot',
        });
        createdRoles.push({ level: index + 1, roleId: role.id });
        console.log(`Created role "${name}" in guild ${guild.name}`);
      } catch (error) {
        console.error(`Failed to create role "${name}":`, error);
      }
    }

    const defaultChannel =
      guild.systemChannel ||
      guild.channels.cache.find(
        (ch) =>
          ch.type === 0 &&
          ch.permissionsFor(guild.members.me).has('SendMessages')
      );
    if (defaultChannel) {
      try {
        await defaultChannel.send(
          '📘 Roles for the quiz level system have been successfully created!'
        );
        try {
          await GuildSettings.findOneAndUpdate(
            { guildId: guild.id },
            { $set: { levelRoles: createdRoles } },
            { upsert: true, new: true }
          );
          console.log(
            `Level roles opgeslagen in database voor guild ${guild.name}`
          );
        } catch (err) {
          console.error('Fout bij opslaan van roles in database:', err);
        }
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    } else {
      console.log('No suitable channel found to send welcome message');
    }
  },
};
