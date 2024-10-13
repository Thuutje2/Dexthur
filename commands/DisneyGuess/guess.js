const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');
const { getCooldownTime, fifteenMinutes } = require('../../cooldown');

module.exports = {
    name: 'guess',
    description: 'Guess the Disney character.',
    async execute(message, args) {
        try {
            if (args.length === 0) {
                return message.reply('Gebruik: !guess <character name> om een Disney-personage te raden.');
            }

            const guessedCharacter = args.join(' ').toLowerCase();

            // Check if user exists
            const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);
            if (userResult.rowCount === 0) {
                await query('INSERT INTO users (user_id, username) VALUES ($1, $2)', [message.author.id, message.author.username]);
            }

            let userPointsResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);
            let userGuessData = userPointsResult.rows[0];

            const currentTime = new Date();

            // Handle initial setup of user data
            if (!userGuessData) {
                await query('INSERT INTO User_Points (user_id, username, points, last_guess_date, last_correct_guess_date, streak, daily_character_id, failed_attempts, hints_given) VALUES ($1, $2, 0, null, null, 0, null, 0, 0)', [message.author.id, message.author.username]);
                userGuessData = {
                    failed_attempts: 0,
                    streak: 0,
                    daily_character_id: null,
                    hints_given: 0
                };
            }

            // Check cooldown for the current character
            if (userGuessData.daily_character_id) {
                if (userGuessData.last_correct_guess_date) {
                    const nextAvailableGuessDate = new Date(userGuessData.last_correct_guess_date);
                    nextAvailableGuessDate.setTime(nextAvailableGuessDate.getTime() + fifteenMinutes);
                    if (currentTime < nextAvailableGuessDate) {
                        const cooldownData = getCooldownTime(userGuessData.last_correct_guess_date);
                        return message.reply(`Je moet wachten tot ${cooldownData.remainingMinutes} minuten voordat je opnieuw kunt raden.`);
                    }
                }

                // If all hints are used, inform user and reset character
                if (userGuessData.failed_attempts >= 6) {
                    const dailyCharacterResult = await query('SELECT * FROM disney_characters WHERE id = $1', [userGuessData.daily_character_id]);
                    const dailyCharacter = dailyCharacterResult.rows[0];

                    // Reset the daily_character_id to allow fetching a new character after cooldown
                    await query('UPDATE User_Points SET daily_character_id = null, streak = 0 WHERE user_id = $1', [message.author.id]);

                    const cooldownData = getCooldownTime(currentTime);
                    return message.reply(`Je hebt alle hints gebruikt. Het personage was **${dailyCharacter.name}**. Je kunt weer raden in ${cooldownData.remainingMinutes} minuten.`);
                }
            }

            // Fetch a new character since the cooldown is up or no character exists
            const dailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
            const dailyCharacter = dailyCharacterResult.rows[0];

            // Update the user points with the new character
            await query('UPDATE User_Points SET daily_character_id = $1, last_guess_date = $2, failed_attempts = 0, hints_given = 0 WHERE user_id = $3', [dailyCharacter.id, currentTime, message.author.id]);
            userGuessData.daily_character_id = dailyCharacter.id;
            userGuessData.failed_attempts = 0;
            userGuessData.hints_given = 0;

            const dailyCharacterHints = dailyCharacter.hints;

            // Check if the guessed character is correct
            if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                const streak = userGuessData.streak + 1;

                let pointsEarned = 0;
                switch (userGuessData.failed_attempts) {
                    case 0: pointsEarned = 50; break;
                    case 1: pointsEarned = 40; break;
                    case 2: pointsEarned = 30; break;
                    case 3: pointsEarned = 20; break;
                    case 4: pointsEarned = 10; break;
                    case 5: pointsEarned = 5; break;
                    default: pointsEarned = 0; break;
                }

                const newPoints = (userGuessData.points || 0) + pointsEarned;
                await query('UPDATE User_Points SET last_guess_date = $1, last_correct_guess_date = $2, streak = $3, points = $4, failed_attempts = 0 WHERE user_id = $5', [currentTime, currentTime, streak, newPoints, message.author.id]);

                const embed = new EmbedBuilder()
                    .setTitle('Correct Guess!')
                    .setDescription(`Het personage was ${dailyCharacter.name}.\nJe hebt ${pointsEarned} punten verdiend!\nCorrect geraden: ${streak}`)
                    .setImage(dailyCharacter.image)
                    .setColor(0x78f06a);

                message.channel.send({ embeds: [embed] });
            } else {
                const failedAttempts = userGuessData.failed_attempts + 1;
                const hintsGiven = Math.min(failedAttempts, dailyCharacterHints.length);

                await query('UPDATE User_Points SET failed_attempts = $1, hints_given = $2 WHERE user_id = $3', [failedAttempts, hintsGiven, message.author.id]);

                if (failedAttempts < 6) {
                    const embed = new EmbedBuilder()
                        .setTitle('Guess the Disney Character')
                        .setDescription('Raad het personage!')
                        .setColor(0xc56af0)
                        .addFields({ name: 'Hints', value: dailyCharacterHints.slice(0, hintsGiven).join('\n') });

                    message.channel.send({ embeds: [embed] });
                } else {
                    // Reset attempts and set the new character
                    await query('UPDATE User_Points SET daily_character_id = null, streak = 0 WHERE user_id = $1', [message.author.id]);

                    // Fetch a new character after hints are exhausted
                    const newDailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
                    const newDailyCharacter = newDailyCharacterResult.rows[0];

                    await query('UPDATE User_Points SET daily_character_id = $1, failed_attempts = 0, hints_given = 0 WHERE user_id = $2', [newDailyCharacter.id, message.author.id]);

                    const cooldownData = getCooldownTime(currentTime);

                    return message.reply(`Helaas, je hebt geen hints meer. Het personage was **${dailyCharacter.name}**. Je kunt weer raden in ${cooldownData.remainingMinutes} minuten.`);
                }
            }

        } catch (error) {
            console.error('Er is een fout opgetreden bij het raden van het personage:', error);
            message.channel.send('Er is een fout opgetreden tijdens het raden van het personage. Probeer het later opnieuw.');
        }
    }
};





























