const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'guessProfile',
    description: 'Show the profile of the user for the Disney character guessing game.',
    aliases: ['guessp', 'gp'],
    async execute(message, args) {
        try {
            let targetUser = message.mentions.users.first() || message.author;

            // Haal de profielgegevens van de gebruiker op uit de User_Points tabel
            const profileResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [targetUser.id]);
            const profile = profileResult.rows[0];

            // Als het profiel niet bestaat, geef een melding en stop de uitvoering van het commando
            if (!profile) {
                return message.reply('This user has not played the Disney Character Guessing Game yet.');
            }

            // Haal de favoriete gegevens van de gebruiker op
            const favoritesResult = await query('SELECT * FROM user_favorites WHERE user_id = $1', [targetUser.id]);
            const favorites = favoritesResult.rows[0] || {};


            // next cooldown
            const guessCooldown = 24 * 60 * 60 * 1000; // 24 uur in milliseconden
            const currentTime = new Date();
            const lastGuessTime = new Date(profile.last_guess_date);
            const timeDifference = currentTime - lastGuessTime;
            const timeRemaining = guessCooldown - timeDifference;
            const remainingHours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));


            // Bouw een embed met de profielgegevens
            const embed = new EmbedBuilder()
                .setTitle(targetUser.username + `'s Profile`)
                .setColor(0x0099FF)
                .setTimestamp()
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '⏳ Next Guess Available In', value: `${remainingHours} hours and ${remainingMinutes} minutes` },
                    { name: '📈 Total Points', value: `${profile.points.toString()} points` },
                    { name: '🔥 Correct guesses count:', value: `${profile.streak.toString()} ` },
                    { name: '🩷 Favorite Character', value: favorites.favorite_character_name || 'Not set' },
                    { name: '🩷 Favorite Serie or Film', value: favorites.favorite_series_film || 'Not set' },
                );

            // Stuur de embed naar de gebruiker
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error occurred in guessProfile command', error);
            message.reply('An error occurred while fetching the profile. Please try again later.');
        }
    }
}



