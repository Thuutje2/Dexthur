const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'guessProfile',
    description: 'Show the profile of the user for the Disney character guessing game.',
    aliases: ['guessp', 'gp'],
    async execute(message, args) {
        try {
            let targetUser = message.mentions.users.first() || message.author;

            // Haal de profielgegevens van de gebruiker op uit de database
            const profileResult = await query('SELECT * FROM user_points WHERE user_id = $1', [targetUser.id]);
            const profile = profileResult.rows[0];

            // Als het profiel niet bestaat, geef een melding en stop de uitvoering van het commando
            if (!profile) {
                return message.reply('This user has not played the Disney Character Guessing Game yet.');
            }

            // Bouw een embed met de profielgegevens
            const embed = new EmbedBuilder()
                .setTitle('Disney Character Guessing Game Profile for ' + targetUser.username)
                .setColor(0x0099FF)
                .setTimestamp()
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: 'Points', value: `${profile.points.toString()} points` },
                    { name: '🔥 Streak', value: `${profile.streak.toString()} days` },
                );

            // Stuur de embed naar de gebruiker
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error occurred in guessProfile command', error);
            message.reply('An error occurred while fetching the profile. Please try again later.');
        }
    }
}
