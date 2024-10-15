const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');
const { getCooldownTime, fifteenMinutes } = require('../../cooldown');

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
                // Insert user into the 'users' table if they don't exist
                await query('INSERT INTO users (user_id, username) VALUES ($1, $2)', [message.author.id, message.author.username]);
            }

            // Fetch user data
            const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);
            let userGuessData = userResult.rowCount > 0 ? userResult.rows[0] : null;

            if (!userGuessData) {
                // If user doesn't exist, create an entry
                await query('INSERT INTO User_Points (user_id, username, points, last_guess_date, last_correct_guess_date, streak, daily_character_id, failed_attempts, hints_given) VALUES ($1, $2, 0, null, null, 0, null, 0, 0)', [message.author.id, message.author.username]);
                userGuessData = {
                    failed_attempts: 0,
                    streak: 0,
                    daily_character_id: null,
                    hints_given: 0
                };
            }

            // Check if cooldown is still active from last correct guess
            if (userGuessData.last_correct_guess_date) {
                const cooldownData = getCooldownTime(userGuessData.last_correct_guess_date);
                if (cooldownData.timeRemaining > 0) {
                    return message.reply(`You must wait ${cooldownData.formattedDate} to guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
                }
            }

            // Check if cooldown is still active after exhausting hints
            if (userGuessData.failed_attempts >= 6) {
                const cooldownData = getCooldownTime(currentTime);
                if (cooldownData.timeRemaining > 0) {
                    return message.reply(`You've run out of hints. You must wait ${cooldownData.formattedDate} to guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
                }
            }

            // Fetch the daily character (only fetch new one if there is none or it's the first guess)
            let dailyCharacter;
            if (!userGuessData.daily_character_id) {
                const dailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
                dailyCharacter = dailyCharacterResult.rows[0];

                // Update the user's data with the new daily character and reset attempts
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

                // Update user points and reset for the next day
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

                // Update failed attempts and hints
                await query('UPDATE User_Points SET failed_attempts = $1, hints_given = $2 WHERE user_id = $3', [failedAttempts, hintsGiven, message.author.id]);

                if (failedAttempts < 6) {
                    const embed = new EmbedBuilder()
                        .setTitle('Guess the Disney Character')
                        .setDescription('Guess the character!')
                        .setColor(0xc56af0)
                        .addFields({ name: 'Hints', value: dailyCharacterHints.slice(0, hintsGiven).join('\n') });

                    message.channel.send({ embeds: [embed] });
                } else {
                    // Max attempts reached, reset the daily character and apply cooldown
                    await query('UPDATE User_Points SET daily_character_id = null, streak = 0 WHERE user_id = $1', [message.author.id]);
                    const cooldownData = getCooldownTime(currentTime);

                    return message.reply(`You've run out of hints. The character was **${dailyCharacter.name}**, From **${dailyCharacter.series_film}**. You must wait ${cooldownData.formattedDate} to guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
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
































































