// const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
// const UserXP = require('../../models/levels/UserXp');
// const { Canvas, loadImage } = require('skia-canvas');
// const path = require('path');

// module.exports = {
//     name: 'leaderboard',
//     description: 'Display the server\'s XP leaderboard',
//     usage: '!leaderboard',
//     category: 'Leveling',
//     data: new SlashCommandBuilder()
//         .setName('leaderboard')
//         .setDescription('Show the server\'s XP leaderboard')
//         .addIntegerOption(option =>
//             option.setName('page')
//                 .setDescription('Page number to view')
//                 .setRequired(false)),

//     async execute(message, args) {
//         const page = args[0] ? parseInt(args[0]) : 1;
//         await this.showLeaderboard(message, page, false);
//     },

//     async executeSlash(interaction) {
//         const page = interaction.options.getInteger('page') || 1;
//         await this.showLeaderboard(interaction, page, true);
//     },

//     async showLeaderboard(interaction, page, isSlash) {
//         try {
//             if (isSlash && interaction.deferred !== true && interaction.replied !== true) {
//                 await interaction.deferReply();
//             }

//             const usersPerPage = 10;
//             const skip = (page - 1) * usersPerPage;
//             const guildId = isSlash ? interaction.guildId : interaction.guild.id;
//             const guild = isSlash ? interaction.guild : interaction.guild;

//             const totalUsers = await UserXP.countDocuments({ guildId });
//             const totalPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));

//             const users = await UserXP.find({ guildId })
//                 .sort({ level: -1, xp: -1 })
//                 .skip(skip)
//                 .limit(usersPerPage);

//             if (!users.length) {
//                 const response = 'No users found in the leaderboard!';
//                 if (isSlash) {
//                     return await interaction.editReply({ content: response });
//                 }
//                 return await interaction.channel.send(response);
//             }

//             // Canvas setup (larger and higher resolution)
//             const width = 900;
//             const height = 1000;
//             const canvas = new Canvas(width, height);
//             const ctx = canvas.getContext('2d');

//             // Smooth edges
//             ctx.antialias = 'subpixel';

//             // Background gradient (light pastel theme)
//             const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
//             bgGradient.addColorStop(0, '#f7fbff');
//             bgGradient.addColorStop(1, '#d9e7f0');
//             ctx.fillStyle = bgGradient;
//             ctx.fillRect(0, 0, width, height);

//             // Title section (header bar)
//             ctx.fillStyle = '#357CA5';
//             ctx.beginPath();
//             ctx.roundRect(0, 0, width, 100, 0);
//             ctx.fill();

//             // Header text
//             ctx.font = 'bold 48px Arial';
//             ctx.fillStyle = '#FFFFFF';
//             ctx.textAlign = 'center';
//             ctx.textBaseline = 'middle';
//             ctx.fillText("🏆 Dexthur's Leaderboard 🏆", width / 2, 55);

//             // Section shadow effect
//             ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
//             ctx.shadowBlur = 10;

//             for (let i = 0; i < users.length; i++) {
//                 const user = users[i];
//                 const member = await guild.members.fetch(user.userId).catch(() => null);
//                 const username = member ? member.user.username : 'Unknown User';
//                 const avatarUrl = member ? member.user.displayAvatarURL({ extension: 'png', size: 128 }) : null;
//                 const position = skip + i + 1;

//                 const rowY = 140 + i * 80;
//                 const rowHeight = 70;
//                 const centerY = rowY + rowHeight / 2;

//                 // Background
//                 const rowColor = position <= 3 ? '#fef6d9' : i % 2 === 0 ? '#ffffffcc' : '#f5f5f5cc';
//                 ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
//                 ctx.shadowBlur = 5;
//                 ctx.fillStyle = rowColor;
//                 ctx.beginPath();
//                 ctx.roundRect(60, rowY, width - 120, rowHeight, 15);
//                 ctx.fill();

//                 // Medal icon
//                 const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `#${position}`;
//                 ctx.font = 'bold 26px Arial';
//                 ctx.fillStyle = '#333';
//                 ctx.textAlign = 'left';
//                 ctx.textBaseline = 'middle';
//                 ctx.fillText(medal, 80, centerY);

//                 // Avatar
//                 const avatarSize = 50;
//                 const avatarX = 130;
//                 const avatarY = centerY - avatarSize / 2;

//                 if (avatarUrl) {
//                     try {
//                         const avatar = await loadImage(avatarUrl);
//                         ctx.save();
//                         ctx.beginPath();
//                         ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
//                         ctx.clip();
//                         ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
//                         ctx.restore();
//                     } catch {}
//                 }

//                 // Username (centered vertically)
//                 ctx.textAlign = 'left';
//                 ctx.textBaseline = 'middle';
//                 ctx.font = 'bold 26px Arial';
//                 ctx.fillStyle = '#1a1a1a';
//                 ctx.fillText(username, avatarX + avatarSize + 20, centerY);

//                 // Level & XP (aligned to the right, same line)
//                 ctx.textAlign = 'right';
//                 ctx.textBaseline = 'middle';
//                 ctx.font = '22px Arial';
//                 ctx.fillStyle = '#357CA5';
//                 ctx.fillText(`Level: ${user.level} • XP: ${user.xp}`, width - 80, centerY);
//             }

//             // Footer
//             ctx.shadowColor = 'transparent';
//             ctx.textAlign = 'center';
//             ctx.font = '22px Arial';
//             ctx.fillStyle = '#555';
//             ctx.fillText(`Page ${page} of ${totalPages}`, width / 2, height - 40);

//             const buffer = await canvas.png;
//             // Send the image
//             const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });

//             if (isSlash) {
//                 await interaction.editReply({ files: [attachment] });
//             } else {
//                 await interaction.channel.send({ files: [attachment] });
//             }

//         } catch (error) {
//             console.error('Error generating leaderboard:', error);
//             const errorMsg = 'There was an error generating the leaderboard!';
//             if (isSlash) {
//                 if (interaction.deferred || interaction.replied) {
//                     await interaction.editReply({ content: errorMsg });
//                 } else {
//                     await interaction.reply({ content: errorMsg, ephemeral: true });
//                 }
//             } else {
//                 await interaction.channel.send(errorMsg);
//             }
//         }
//     }
// };