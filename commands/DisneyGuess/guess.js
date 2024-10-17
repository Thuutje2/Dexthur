const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');
const { getCooldownTime } = require('../../cooldown');

module.exports = {
    name: 'guess',
    description: 'Guess the Disney character.',
    async execute(message, args) {
        try {
            if (args.length === 0) {
                return message.reply('Use: !guess <character name> to guess a Disney character.');
            }

            const guessedCharacter = args.join(' ').toLowerCase();
            if (!await isCharacterValid(guessedCharacter)) {
                return message.reply(`The character ${guessedCharacter} is not valid. Please try again.`);
            }
            const currentTime = new Date();

            const userExistResult = await query('SELECT * FROM users WHERE user_id = $1', [message.author.id]);
            if (userExistResult.rowCount === 0) {
                await query('INSERT INTO users (user_id, username) VALUES ($1, $2)', [message.author.id, message.author.username]);
            }

            const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);
            let userGuessData = userResult.rowCount > 0 ? userResult.rows[0] : null;

            if (!userGuessData) {
                await query('INSERT INTO User_Points (user_id, username, points, last_guess_date, last_correct_guess_date, streak, daily_character_id, failed_attempts, hints_given, last_failed_guess_date) VALUES ($1, $2, 0, null, null, 0, null, 0, 0, null)', [message.author.id, message.author.username]);
                userGuessData = {
                    failed_attempts: 0,
                    streak: 0,
                    daily_character_id: null,
                    hints_given: 0,
                    last_failed_guess_date: null
                };
            }

            // Check cooldown from last correct or failed guess
            const cooldownData = userGuessData.last_correct_guess_date ?
                getCooldownTime(userGuessData.last_correct_guess_date) :
                getCooldownTime(userGuessData.last_failed_guess_date);

            if (cooldownData.timeRemaining > 0) {
                return message.reply(`You must wait ${cooldownData.formattedDate} to guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
            }

            // Fetch the daily character (only fetch new one if there is none or it's the first guess)
            let dailyCharacter;
            if (!userGuessData.daily_character_id) {
                const dailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
                dailyCharacter = dailyCharacterResult.rows[0];

                await query('UPDATE User_Points SET daily_character_id = $1, last_guess_date = $2, failed_attempts = 0, hints_given = 0 WHERE user_id = $3', [dailyCharacter.id, currentTime, message.author.id]);

                userGuessData.daily_character_id = dailyCharacter.id;
                userGuessData.failed_attempts = 0;
                userGuessData.hints_given = 0;
            } else {
                const characterResult = await query('SELECT * FROM disney_characters WHERE id = $1', [userGuessData.daily_character_id]);
                dailyCharacter = characterResult.rows[0];
            }

            const dailyCharacterHints = dailyCharacter.hints;

            // Guess logic
            if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                const streak = userGuessData.streak + 1;
                const pointsEarned = [50, 40, 30, 20, 10, 5][userGuessData.failed_attempts] || 0;
                const newPoints = (userGuessData.points || 0) + pointsEarned;

                await query('UPDATE User_Points SET last_guess_date = $1, last_correct_guess_date = $2, streak = $3, points = $4, failed_attempts = 0, daily_character_id = null WHERE user_id = $5', [currentTime, currentTime, streak, newPoints, message.author.id]);

                const embed = new EmbedBuilder()
                    .setTitle('Correct Guess!')
                    .setDescription(`The character was **${dailyCharacter.name}**.\n From **${dailyCharacter.series_film}** \nYou earned **${pointsEarned}** points!\nCorrect guesses streak: **${streak}**`)
                    .setImage(dailyCharacter.image)
                    .setColor(0x78f06a);

                message.channel.send({ embeds: [embed] });
            } else {
                const failedAttempts = userGuessData.failed_attempts + 1;
                const hintsGiven = Math.min(failedAttempts, dailyCharacterHints.length);

                // Update failed_attempts, hints_given, and set last_failed_guess_date if 6 failed attempts
                await query('UPDATE User_Points SET failed_attempts = $1, hints_given = $2 WHERE user_id = $3', [failedAttempts, hintsGiven, message.author.id]);

                if (failedAttempts < 6) {
                    const embed = new EmbedBuilder()
                        .setTitle('Guess the Disney Character')
                        .setDescription('Guess the character!')
                        .setColor(0xc56af0)
                        .addFields({ name: 'Hints', value: dailyCharacterHints.slice(0, hintsGiven).join('\n') });

                    message.channel.send({ embeds: [embed] });
                } else if (failedAttempts === 6) {
                    await query('UPDATE User_Points SET daily_character_id = null, failed_attempts = 0, last_failed_guess_date = $1 WHERE user_id = $2', [currentTime, message.author.id]);

                    const correctCharacterName = dailyCharacter.name;
                    const correctCharacterFilm = dailyCharacter.series_film;

                    message.reply(`You've run out of hints. The character was **${correctCharacterName}**, From **${correctCharacterFilm}**. You can try again right now.`);
                }
            }
        } catch (error) {
            console.error('Error guessing the character:', error);
            message.channel.send('An error occurred while guessing the character. Please try again later.');
        }
    }
};

// Helper function to check if the guessed character is valid
async function isCharacterValid(guessedCharacter) {
    const characterResult = await query('SELECT * FROM disney_characters WHERE LOWER(name) = $1', [guessedCharacter]);
    return characterResult.rowCount > 0;
}


