const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { Canvas } = require('skia-canvas'); // ✅ import Canvas here
const { loadBackground, drawAvatar } = require('../../utils/canvasUtils');
const { drawProgressBar } = require('../../utils/progressBarCanvas');
const UserXP = require('../../models/levels/UserXp');
const { xpNeededForLevel } = require('../../utils/xpLevelSystemUtils');

module.exports = {
    name: 'level',
    description: 'Check your level',
    usage: '!level [@user]',
    category: 'Leveling',
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check jouw huidige level'),

    async execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author;
        await this.checkLevel(message, targetUser);
    },

    async executeSlash(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        await this.checkLevelSlash(interaction, targetUser);
    },

    async getUserRank(userId, guildId) {
        try {
            const users = await UserXP.find({ guildId }).sort({ level: -1, xp: -1 });
            const userRank = users.findIndex(u => u.userId === userId) + 1;
            return userRank || 'N/A';
        } catch (error) {
            console.error('Error fetching user rank:', error);
            return 'N/A';
        }
    },

    async createLevelCard(user, userData, rank) {
        try {
            // ✅ Create a new Skia canvas
            const width = 800;
            const height = 300;
            const canvas = new Canvas(width, height);
            const ctx = canvas.getContext('2d');

            // Draw background and overlay
            await loadBackground(ctx, canvas);

            // Draw avatar
            await drawAvatar(ctx, user);

            // Add username
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#37357eff';
            ctx.fillText(user.username, 240, 100);

            // XP + level info
            const xpForNextLevel = xpNeededForLevel(userData.level);
            ctx.font = '30px Arial';
            ctx.fillStyle = '#37357eff';
            ctx.fillText(`Level: ${userData.level}`, 240, 150);
            ctx.fillText(`XP: ${userData.xp}/${xpForNextLevel}`, 240, 190);
            ctx.fillText(`Rank: #${rank}`, 600, 150);

            // Progress bar
            const progress = userData.xp / xpForNextLevel;
            drawProgressBar(ctx, 240, 220, 500, 30, progress);

            // ✅ Convert to buffer (Skia async getter)
            const buffer = await canvas.png;
            return new AttachmentBuilder(buffer, { name: 'level-card.png' });
        } catch (error) {
            console.error('Error creating level card:', error);
            throw error;
        }
    },

    async checkLevel(message, user) {
        try {
            const userData = await this.getUserData(user.id, message.guild.id);
            const rank = await this.getUserRank(user.id, message.guild.id);
            const levelCard = await this.createLevelCard(user, userData, rank);
            await message.reply({ files: [levelCard] });
        } catch (error) {
            console.error(error);
            await message.reply('Error generating level card!');
        }
    },

    async checkLevelSlash(interaction, user) {
        try {
            await interaction.deferReply();
            const userData = await this.getUserData(user.id, interaction.guild.id);
            const rank = await this.getUserRank(user.id, interaction.guild.id);
            const levelCard = await this.createLevelCard(user, userData, rank);
            await interaction.editReply({ files: [levelCard] });
        } catch (error) {
            console.error(error);
            try {
                if (interaction.deferred) {
                    await interaction.editReply({ content: 'Error generating level card!' });
                } else {
                    await interaction.reply({ content: 'Error generating level card!', ephemeral: true });
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    },

    async getUserData(userId, guildId) {
        try {
            let userData = await UserXP.findOne({ userId, guildId });
            if (!userData) {
                userData = new UserXP({ userId, guildId, xp: 0, level: 1 });
                await userData.save();
            }
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return { xp: 0, level: 1 };
        }
    }
};
