const { EmbedBuilder } = require('discord.js');
const { query } = require('../../database');
const { getCooldownTime } = require('../../cooldown'); 

module.exports = {
    name: 'guess',
    description: 'Guess the Disney character.',
    async execute(message, args) {
        try {
            if (args.length === 0) {
                return message.reply(
                    'Use: `!guess <character name>` to guess a Disney character.'
                );
            }

            const guessedCharacter = args.join(' ').toLowerCase();
            const currentTime = new Date();
            const userId = message.author.id;
            const username = message.author.username;

            // --- 1. Validate the guessed character early ---
            if (!(await isCharacterValid(guessedCharacter))) {
                return message.reply(
                    `The character "${guessedCharacter}" is not a valid Disney character name in my database. Please try again with a real character.`
                );
            }

            // --- 2. Ensure user exists in 'users' table ---
            const userExistResult = await query(
                'SELECT * FROM users WHERE user_id = $1',
                [userId]
            );
            if (userExistResult.rowCount === 0) {
                await query('INSERT INTO users (user_id, username) VALUES ($1, $2)', [
                    userId,
                    username,
                ]);
            }

            // --- 3. Fetch or Initialize User_Points data ---
            let userPointsDataResult = await query(
                'SELECT * FROM User_Points WHERE user_id = $1',
                [userId]
            );

            if (userPointsDataResult.rowCount === 0) {
                await query(
                    'INSERT INTO User_Points (user_id, username, points, last_guess_date, last_correct_guess_date, streak, daily_character_id, failed_attempts, hints_given, last_failed_guess_date) VALUES ($1, $2, 0, null, null, 0, null, 0, 0, null)',
                    [userId, username]
                );
                // Re-fetch to get the newly inserted default values for userGuessData
                userPointsDataResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [userId]);
            }
            let userGuessData = userPointsDataResult.rows[0];

            // --- 4. Cooldown Logic ---
            let cooldownApplied = false;
            let cooldownMessage = '';

            // Cooldown after a correct guess (waiting for next day's character)
            if (userGuessData.last_correct_guess_date) {
                const correctGuessCooldown = getCooldownTime(userGuessData.last_correct_guess_date);
                if (correctGuessCooldown.timeRemaining > 0) {
                    cooldownApplied = true;
                    cooldownMessage = `You've already correctly guessed the daily character! Please wait ${correctGuessCooldown.remainingMinutes} minute(s) for a new one.`;
                }
            }
            // Cooldown after hitting 6 failed attempts on a character
            else if (userGuessData.daily_character_id && userGuessData.failed_attempts >= 6) {
                const failedGuessCooldown = getCooldownTime(userGuessData.last_failed_guess_date);
                if (failedGuessCooldown.timeRemaining > 0) {
                    cooldownApplied = true;
                    cooldownMessage = `You've exhausted your hints for the previous character. Please wait ${failedGuessCooldown.remainingMinutes} minute(s) to guess a new one.`;
                }
            }

            if (cooldownApplied) {
                return message.reply(cooldownMessage);
            }

            // --- 5. Fetch or Assign Daily Character ---
            let dailyCharacter;
            // If no daily character assigned OR
            // if they've had 6 failed attempts on the *previous* character (meaning they need a new one)
            if (!userGuessData.daily_character_id || userGuessData.failed_attempts >= 6) {
                const dailyCharacterResult = await query(
                    'SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1'
                );
                dailyCharacter = dailyCharacterResult.rows[0];

                // Reset user's state for the new character
                await query(
                    'UPDATE User_Points SET daily_character_id = $1, last_guess_date = $2, failed_attempts = 0, hints_given = 0, streak = 0, last_failed_guess_date = null, last_correct_guess_date = null WHERE user_id = $3',
                    [dailyCharacter.id, currentTime, userId]
                );
                // Re-fetch userGuessData to reflect the updated state immediately
                userGuessData = (await query('SELECT * FROM User_Points WHERE user_id = $1', [userId])).rows[0];
            } else {
                // Continue guessing the currently assigned daily character
                const characterResult = await query(
                    'SELECT * FROM disney_characters WHERE id = $1',
                    [userGuessData.daily_character_id]
                );
                dailyCharacter = characterResult.rows[0];
            }

            const dailyCharacterHints = dailyCharacter.hints || []; // Ensure hints is an array, even if empty

            // --- 6. Guess Logic ---
            if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                // --- Correct Guess ---
                const streak = userGuessData.streak + 1;
                // Points are awarded based on how many attempts it took for THIS character
                const pointsEarned = [50, 40, 30, 20, 10, 5][userGuessData.failed_attempts] || 0;
                const newPoints = (userGuessData.points || 0) + pointsEarned;

                await query(
                    'UPDATE User_Points SET last_guess_date = $1, last_correct_guess_date = $2, streak = $3, points = $4, failed_attempts = 0, daily_character_id = null, hints_given = 0 WHERE user_id = $5',
                    [currentTime, currentTime, streak, newPoints, userId]
                );

                const embed = new EmbedBuilder()
                    .setTitle('🎉 Correct Guess! 🎉')
                    .setDescription(
                        `You guessed **${dailyCharacter.name}** correctly, from **${dailyCharacter.series_film}**!\n` +
                        `You earned **${pointsEarned}** points!\n` +
                        `Your current correct guesses streak: **${streak}**`
                    )
                    .setImage(dailyCharacter.image)
                    .setColor(0x78f06a); // Green color for success

                message.channel.send({ embeds: [embed] });

            } else {
                // --- Incorrect Guess ---
                const failedAttempts = userGuessData.failed_attempts + 1;

                if (failedAttempts < 6) { // User still has hints left
                    const hintsGiven = Math.min(failedAttempts, dailyCharacterHints.length);

                    await query(
                        'UPDATE User_Points SET failed_attempts = $1, hints_given = $2, last_guess_date = $3 WHERE user_id = $4',
                        [failedAttempts, hintsGiven, currentTime, userId]
                    );

                    const embed = new EmbedBuilder()
                        .setTitle('❌ Incorrect Guess! Try Again!')
                        .setDescription(
                            `That's not it! You've made **${failedAttempts}** incorrect guess(es) for today's character.`
                        )
                        .setColor(0xf06a6a) // Red color for incorrect
                        .addFields({
                            name: 'Hints',
                            value: hintsGiven > 0 ? dailyCharacterHints.slice(0, hintsGiven).join('\n') : 'No hints available yet! Try guessing again to reveal one.',
                        });

                    message.channel.send({ embeds: [embed] });

                } else { // User runs out of hints (6 or more failed attempts)
                    await query(
                        'UPDATE User_Points SET daily_character_id = null, failed_attempts = 0, hints_given = 0, streak = 0, last_failed_guess_date = $1 WHERE user_id = $2',
                        [currentTime, userId]
                    );

                    const correctCharacterName = dailyCharacter.name;
                    const correctCharacterFilm = dailyCharacter.series_film;

                    message.reply(
                        `You've run out of hints. The character was **${correctCharacterName}** from **${correctCharacterFilm}**.\n` +
                        `You can try guessing a **new** character after a short cooldown.`
                    );
                }
            }
        } catch (error) {
            console.error('Error guessing the character:', error);
            message.channel.send(
                'An unexpected error occurred while processing your guess. Please try again later.'
            );
        }
    },
};

// Helper function to check if the guessed character is valid in the database
async function isCharacterValid(guessedCharacter) {
    const characterResult = await query(
        'SELECT * FROM disney_characters WHERE LOWER(name) = $1',
        [guessedCharacter]
    );
    return characterResult.rowCount > 0;
}