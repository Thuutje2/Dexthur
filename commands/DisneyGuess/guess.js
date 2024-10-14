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
            const currentTime = new Date();

            const userGuessData = await getUserData(message.author.id, message.author.username, currentTime);

            if (userGuessData.last_guess_date) {
                const cooldownData = getCooldownTime(userGuessData.last_guess_date);
                if (cooldownData.timeRemaining > 0) {
                    return message.reply(`You must wait ${cooldownData.formattedDate} to guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
                }
            }

            if (await isCharacterValid(guessedCharacter)) {
                // Cooldown check
                if (userGuessData.last_correct_guess_date) {
                    const cooldownData = getCooldownTime(userGuessData.last_correct_guess_date);
                    if (cooldownData.timeRemaining > 0) {
                        return message.reply(`You must wait ${cooldownData.formattedDate} to guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
                    }
                }

                // Fetch or update daily character
                const dailyCharacter = await getDailyCharacter(userGuessData, message.author.id, currentTime);

                if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                    await handleCorrectGuess(userGuessData, dailyCharacter, message, currentTime);
                } else {
                    await handleFailedGuess(userGuessData, dailyCharacter, message, currentTime);
                }
            } else {
                return message.reply(`The character **${guessedCharacter}** is not in the database.`);
            }

        } catch (error) {
            console.error('Error guessing the character:', error);
            message.channel.send('An error occurred while guessing the character. Please try again later.');
        }
    }
};

async function getUserData(userId, username, currentTime) {
    const userExistResult = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (userExistResult.rowCount === 0) {
        await query('INSERT INTO users (user_id, username) VALUES ($1, $2)', [userId, username]);
    }

    const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [userId]);
    let userGuessData = userResult.rowCount > 0 ? userResult.rows[0] : null;

    if (!userGuessData) {
        await query('INSERT INTO User_Points (user_id, username, points, last_guess_date, last_correct_guess_date, streak, daily_character_id, failed_attempts, hints_given) VALUES ($1, $2, 0, null, null, 0, null, 0, 0)', [userId, username]);
        userGuessData = { failed_attempts: 0, streak: 0, daily_character_id: null, hints_given: 0 };
    }

    return userGuessData;
}

async function getDailyCharacter(userGuessData, userId, currentTime) {
    if (!userGuessData.daily_character_id) {
        // Fetch a random character if the user doesn't have a daily character
        const dailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');

        if (dailyCharacterResult.rowCount === 0) {
            throw new Error('No Disney characters found in the database.');
        }

        const dailyCharacter = dailyCharacterResult.rows[0];

        // Assign the random character to the user
        await query('UPDATE User_Points SET daily_character_id = $1, last_guess_date = $2, failed_attempts = 0, hints_given = 0 WHERE user_id = $3', [dailyCharacter.id, currentTime, userId]);

        userGuessData.daily_character_id = dailyCharacter.id;
        userGuessData.failed_attempts = 0;
        userGuessData.hints_given = 0;

        return dailyCharacter; // Make sure to return the character here
    } else {
        // Fetch the daily character using the user's stored daily_character_id
        const characterResult = await query('SELECT * FROM disney_characters WHERE id = $1', [userGuessData.daily_character_id]);

        if (characterResult.rowCount === 0) {
            throw new Error(`Daily character with ID ${userGuessData.daily_character_id} not found.`);
        }

        return characterResult.rows[0]; // Return the character found by ID
    }
}


async function handleCorrectGuess(userGuessData, dailyCharacter, message, currentTime) {
    const streak = userGuessData.streak + 1;
    const pointsEarned = [50, 40, 30, 20, 10, 5][userGuessData.failed_attempts] || 0;
    const newPoints = (userGuessData.points || 0) + pointsEarned;

    await query('UPDATE User_Points SET last_guess_date = $1, last_correct_guess_date = $2, streak = $3, points = $4, failed_attempts = 0, daily_character_id = null WHERE user_id = $5', [currentTime, currentTime, streak, newPoints, message.author.id]);

    const embed = new EmbedBuilder()
        .setTitle('Correct Guess!')
        .setDescription(`The character was **${dailyCharacter.name}**.\n From **${dailyCharacter.series_film}** \n You earned **${pointsEarned}** points!\nCorrect guesses count: **${streak}**`)
        .setImage(dailyCharacter.image)
        .setColor(0x78f06a);

    message.channel.send({ embeds: [embed] });
}

async function handleFailedGuess(userGuessData, dailyCharacter, message, currentTime) {
    const failedAttempts = userGuessData.failed_attempts + 1;
    const hintsGiven = Math.min(failedAttempts, dailyCharacter.hints.length);

    await query('UPDATE User_Points SET failed_attempts = $1, hints_given = $2 WHERE user_id = $3', [failedAttempts, hintsGiven, message.author.id]);

    if (failedAttempts < 6) {
        const embed = new EmbedBuilder()
            .setTitle('Guess the Disney Character')
            .setDescription('Guess the character!')
            .setColor(0xc56af0)
            .addFields({ name: 'Hints', value: dailyCharacter.hints.slice(0, hintsGiven).join('\n') });

        message.channel.send({ embeds: [embed] });
    } else {
        // Start cooldown
        const cooldownData = getCooldownTime(currentTime);
        await query('UPDATE User_Points SET daily_character_id = null, streak = 0, last_guess_date = $1 WHERE user_id = $2', [currentTime, message.author.id]);

        message.reply(`You've run out of hints. The character was **${dailyCharacter.name}**. Try again after ${cooldownData.remainingMinutes} minutes.`);
    }
}


async function isCharacterValid(guessedCharacter) {
    const characterResult = await query('SELECT * FROM disney_characters WHERE LOWER(name) = $1', [guessedCharacter]);
    return characterResult.rowCount > 0;
}































