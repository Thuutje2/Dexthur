const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/setup/GuildSettings'); 

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
  0xe0bbE4, // lila
  0xffdab9, // perzik
];

module.exports = {
  name: 'setup-roles',
  description: 'Create the level roles for the quiz system',
  usage: '!setup-roles',
  category: 'Admin',
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Create the level roles for the quiz system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interactionOrMessage) {
    // Check if it's an interaction (slash command) or message (prefix command)
    const isInteraction = interactionOrMessage.isCommand?.() || interactionOrMessage.commandName;
    const guild = interactionOrMessage.guild;
    const member = isInteraction ? interactionOrMessage.member : interactionOrMessage.member;

    // Check if user has permission to manage roles
    if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const errorMsg = '❌ You do not have permission to manage roles in this server!';
      if (isInteraction) {
        return await interactionOrMessage.reply({ content: errorMsg, ephemeral: true });
      } else {
        return await interactionOrMessage.reply(errorMsg);
      }
    }

    // Check if bot has permission to manage roles
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const errorMsg = '❌ I do not have permission to manage roles in this server!';
      if (isInteraction) {
        return await interactionOrMessage.reply({ content: errorMsg, ephemeral: true });
      } else {
        return await interactionOrMessage.reply(errorMsg);
      }
    }

    const statusMsg = '🔄 Creating level roles...';
    if (isInteraction) {
      await interactionOrMessage.reply({ content: statusMsg, ephemeral: true });
    } else {
      await interactionOrMessage.reply(statusMsg);
    }

    const createdRoles = [];
    const skippedRoles = [];
    let errorCount = 0;

    for (const [index, name] of roleNames.entries()) {
      try {
        // Check if role already exists
        const existingRole = guild.roles.cache.find(role => role.name === name);
        if (existingRole) {
          skippedRoles.push(name);
          console.log(`Role "${name}" already exists in guild ${guild.name}`);
          continue;
        }

        const role = await guild.roles.create({
          name,
          color: pastelColors[index % pastelColors.length],
          reason: 'Level role for quiz bot',
        });
        createdRoles.push({ level: index + 1, roleId: role.id, name });
        console.log(`Created role "${name}" in guild ${guild.name}`);
        try {
                  await GuildSettings.findOneAndUpdate(
                    { guildId: guild.id },
                    { $set: { levelRoles: createdRoles } },
                    { upsert: true, new: true }
                  );
                  console.log(`Level roles opgeslagen in database voor guild ${guild.name}`);
                } catch (err) {
                  console.error('Fout bij opslaan van roles in database:', err);
              }
      } catch (error) {
        console.error(`Failed to create role "${name}":`, error);
        errorCount++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🎭 Role Setup Results')
      .setColor(0x00AEFF)
      .setTimestamp();

    if (createdRoles.length > 0) {
      embed.addFields({
        name: '✅ Created Roles',
        value: createdRoles.map(role => `• ${role.name} (Level ${role.level})`).join('\n'),
        inline: false
      });
    }

    if (skippedRoles.length > 0) {
      embed.addFields({
        name: '⏭️ Skipped Roles (already existed)',
        value: skippedRoles.map(name => `• ${name}`).join('\n'),
        inline: false
      });
    }

    if (errorCount > 0) {
      embed.addFields({
        name: '❌ Errors',
        value: `${errorCount} roles could not be created. Please check the bot permissions.`,
        inline: false
      });
    }

    if (createdRoles.length === 0 && skippedRoles.length === roleNames.length) {
      embed.setDescription('🎉 All roles already exist! The system is already set up.');
    } else if (createdRoles.length > 0) {
      embed.setDescription('🎉 Role setup complete!');
    }

    if (isInteraction) {
      await interactionOrMessage.editReply({ content: '', embeds: [embed] });
    } else {
      await interactionOrMessage.channel.send({ embeds: [embed] });
    }
  },

  async executeSlash(interaction) {
    await this.execute(interaction);
  },
};
