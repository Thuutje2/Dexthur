const { getCooldownTime } = require('../../functions/cooldown.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'disneyCooldownReminder',
    description: 'show the remaining time until the user can guess again',
    aliases: ['dcr'],
    async execute(message, args) {
        try {
            let targetUser = message.mentions.users.first() || message.author;

            // Get the user's profile data from the User_Points table
            const profileResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [targetUser.id]);
            const profile = profileResult.rows[0];

            // If the profile does not exist, give a message and stop the execution of the command
            if (!profile) {
                return message.reply('This user has not played the Disney Character Guessing Game yet.');
            }

            // Convert last_guess_date to a Date object
            const lastGuessDate = new Date(profile.last_correct_guess_date);
            const cooldown = getCooldownTime(lastGuessDate);

            // Build an embed with the profile data
            const embed = new EmbedBuilder()
                .setTitle('Cooldown Reminder')
                .setColor(0x0099FF)
                .setTimestamp()
                .addFields(
                    { name: '⏳ Next Guess Available In', value: `${cooldown.remainingMinutes} minutes` },
                );

            // Send the embed to the user
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error occurred in disneyCooldownReminder command', error);
            message.reply('An error occurred while fetching the profile. Please try again later.');
        }
    }
}