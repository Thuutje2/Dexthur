const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');
const { getCooldownTime, cooldown } = require('../../cooldown');

module.exports = {
    name: 'guess',
    description: 'Guess the Disney character.',
    async execute(message, args) {
        try {
            if (args.length === 0) {
                return message.reply('Use: !guess <character name> to guess a Disney character.');
            }

            const guessedCharacter = args.join(' ').toLowerCase();

            const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);
            if (userResult.rowCount === 0) {
                await query('INSERT INTO users (user_id, username) VALUES ($1, $2)', [message.author.id, message.author.username]);
            }

            let userPointsResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);
            let userGuessData = userPointsResult.rows[0];

            const currentTime = new Date();

            if (userGuessData) {
                const cooldownData = getCooldownTime(userGuessData.last_guess_date);

                if (userGuessData.failed_attempts >= 6) {
                    if (cooldownData.timeRemaining > 0) {
                        return message.reply(`Try guessing a new character ${cooldownData.remainingMinutes} minutes.`);
                    } else {
                        await query('UPDATE User_Points SET failed_attempts = 0, hints_given = 0 WHERE user_id = $1', [message.author.id]);
                        userGuessData.failed_attempts = 0;
                        userGuessData.hints_given = 0;
                    }
                }

                if (userGuessData.last_correct_guess_date) {
                    const nextAvailableGuessDate = new Date(userGuessData.last_correct_guess_date);
                    nextAvailableGuessDate.setHours(24, 0, 0, 0);

                    if (currentTime < nextAvailableGuessDate) {
                        const cooldownData = getCooldownTime(userGuessData.last_correct_guess_date);
                        return message.reply(`You have to wait until ${cooldownData.timeRemaining} before you can guess again. (${cooldownData.remainingMinutes} minutes remaining)`);
                    }
                }
            } else {
                await query('INSERT INTO User_Points (user_id, username, points, last_guess_date, last_correct_guess_date, streak, daily_character_id, failed_attempts, hints_given) VALUES ($1, $2, 0, null, null, 0, null, 0, 0)', [message.author.id, message.author.username]);
                userGuessData = {
                    failed_attempts: 0,
                    streak: 0,
                    daily_character_id: null,
                    hints_given: 0
                };
            }

            if (!userGuessData.daily_character_id || (new Date() - new Date(userGuessData.last_guess_date) > cooldown)) {
                const dailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
                const dailyCharacter = dailyCharacterResult.rows[0];

                await query('UPDATE User_Points SET daily_character_id = $1, last_guess_date = $2, failed_attempts = 0, hints_given = 0 WHERE user_id = $3', [dailyCharacter.id, currentTime, message.author.id]);

                userGuessData.daily_character_id = dailyCharacter.id;
                userGuessData.failed_attempts = 0;
                userGuessData.hints_given = 0;
            }

            const characterResult = await query('SELECT * FROM disney_characters WHERE id = $1', [userGuessData.daily_character_id]);
            const dailyCharacter = characterResult.rows[0];
            const dailyCharacterHints = dailyCharacter.hints;

            if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                const streak = userGuessData.streak + 1;

                let pointsEarned = 0;
                switch (userGuessData.failed_attempts) {
                    case 0:
                        pointsEarned = 50;
                        break;
                    case 1:
                        pointsEarned = 40;
                        break;
                    case 2:
                        pointsEarned = 30;
                        break;
                    case 3:
                        pointsEarned = 20;
                        break;
                    case 4:
                        pointsEarned = 10;
                        break;
                    case 5:
                        pointsEarned = 5;
                        break;
                    default:
                        pointsEarned = 0;
                        break;
                }

                const newPoints = (userGuessData.points || 0) + pointsEarned;
                await query('UPDATE User_Points SET last_guess_date = $1, last_correct_guess_date = $2, streak = $3, points = $4, failed_attempts = 0, daily_character_id = null WHERE user_id = $5', [currentTime, currentTime, streak, newPoints, message.author.id]);

                const embed = new EmbedBuilder()
                    .setTitle('Correct Guess!')
                    .setDescription(`The character was ${dailyCharacter.name}.\nYou earned ${pointsEarned} points!\nCorrect guesses count: ${streak}`)
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
                        .setDescription('Guess the character!')
                        .setColor(0xc56af0)
                        .addFields({ name: 'Hints', value: dailyCharacterHints.slice(0, hintsGiven).join('\n') });

                    message.channel.send({ embeds: [embed] });
                } else {
                    await query('UPDATE User_Points SET daily_character_id = null, streak = 0 WHERE user_id = $1', [message.author.id]);

                    const cooldownData = getCooldownTime(currentTime);

                    return message.reply(`Unfortunately, you have run out of hints. The character was **${dailyCharacter.name}**. You will be able to guess again in ${cooldownData.remainingMinutes} minutes.`);
                }
            }

        } catch (error) {
            console.error('Er is een fout opgetreden bij het raden van het personage:', error);
            message.channel.send('An error occurred while guessing the character. Please try again later.');
        }
    }
};
























