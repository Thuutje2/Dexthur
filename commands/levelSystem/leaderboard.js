const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const UserXP = require('../../models/levels/UserXp');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
    name: 'leaderboard',
    description: 'Display the server\'s XP leaderboard',
    usage: '!leaderboard',
    category: 'Leveling',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the server\'s XP leaderboard')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number to view')
                .setRequired(false)),

    async execute(message, args) {
        const page = args[0] ? parseInt(args[0]) : 1;
        await this.showLeaderboard(message, page, false);
    },

    async executeSlash(interaction) {
        const page = interaction.options.getInteger('page') || 1;
        await this.showLeaderboard(interaction, page, true);
    },

    async showLeaderboard(interaction, page, isSlash) {
        try {
            if (isSlash && interaction.deferred !== true && interaction.replied !== true) {
                await interaction.deferReply();
            }

            const usersPerPage = 10;
            const skip = (page - 1) * usersPerPage;
            const guildId = isSlash ? interaction.guildId : interaction.guild.id;
            const guild = isSlash ? interaction.guild : interaction.guild;

            const totalUsers = await UserXP.countDocuments({ guildId });
            const totalPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));

            const users = await UserXP.find({ guildId })
                .sort({ level: -1, xp: -1 })
                .skip(skip)
                .limit(usersPerPage);

            if (!users.length) {
                const response = 'No users found in the leaderboard!';
                if (isSlash) {
                    return await interaction.editReply({ content: response });
                }
                return await interaction.channel.send(response);
            }

            // Canvas setup
            const width = 700;
            const height = 700;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#ffffffff'); 
            gradient.addColorStop(1, '#a7a7a5ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Header bar
            ctx.fillRect(0, 0, width, 60);

            // Draw header text inline with bear image
            ctx.font = 'bold 42px';
            ctx.fillStyle = '#000000ff';
            ctx.textBaseline = 'middle'; 
            ctx.fillText("Dexthur's Leaderboard", 100, 50);

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const member = await guild.members.fetch(user.userId).catch(() => null);
                const username = member ? member.user.username : 'Unknown User';
                const avatarUrl = member ? member.user.displayAvatarURL({ extension: 'png', size: 64, forceStatic: true }) : null;
                const position = skip + i + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
                const rowTop = 100 + i * 60;
                const rowHeight = 50;
                const rowCenterY = rowTop + rowHeight / 2;

                // Card-style row
                ctx.fillStyle = i % 2 === 0 ? '#fff8ee' : '#fcefdc';
                ctx.beginPath();
                ctx.roundRect(40, rowTop, width - 80, rowHeight, 12);
                ctx.fill();
                ctx.strokeStyle = '#1c1b1bff';
                ctx.stroke();

                // Avatar
                if (avatarUrl) {
                    try {
                        const avatar = await loadImage(avatarUrl);
                        const avatarSize = 36;
                        const avatarX = 55;
                        const avatarY = rowCenterY - avatarSize / 2;

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
                        ctx.restore();
                    } catch (err) {
                        console.warn(`Could not load avatar for ${username}`, err);
                    }
                }

                const textX = 105;
                ctx.font = 'bold 22px';
                ctx.fillStyle = '#23272A';
                ctx.textBaseline = 'middle';  // This centers the text vertically
                ctx.fillText(`${medal} ${username}`, textX, rowCenterY);

                ctx.font = '20px';
                ctx.fillStyle = '#23272A';
                ctx.textAlign = 'right';
                ctx.fillText(`Level: ${user.level}`, width - 60, rowCenterY);
                ctx.textAlign = 'left';  // Reset for future text

                            }

            // Footer
            ctx.beginPath();
            ctx.moveTo(40, height - 60);
            ctx.lineTo(width - 40, height - 60);
            ctx.strokeStyle = '#23272A';
            ctx.stroke();

            ctx.font = '20px';
            ctx.fillStyle = '#000000ff';
            ctx.fillText(`Page ${page} of ${totalPages}`, 40, height - 30);


            // Send the image
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'leaderboard.png' });

            if (isSlash) {
                await interaction.editReply({ files: [attachment] });
            } else {
                await interaction.channel.send({ files: [attachment] });
            }

        } catch (error) {
            console.error('Error generating leaderboard:', error);
            const errorMsg = 'There was an error generating the leaderboard!';
            if (isSlash) {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: errorMsg });
                } else {
                    await interaction.reply({ content: errorMsg, ephemeral: true });
                }
            } else {
                await interaction.channel.send(errorMsg);
            }
        }
    }
};