const { EmbedBuilder } = require('discord.js');
const { DisneyCharacter, User, UserPoints, DisneyUser } = require('../../models/index');
const { getCooldownTime } = require('../../cooldown');
const { checkDisneyAchievements } = require('../../utils/achievementManager'); // Use your existing manager
const allAchievements = require('../../data/achievements'); // Import achievements data

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

            // --- 2. Ensure user exists in 'users' collection ---
            await DisneyUser.findOneAndUpdate(
                { user_id: userId },
                { user_id: userId, username: username },
                { upsert: true, new: true }
            );

            // --- 3. Fetch or Initialize UserPoints data ---
            let userGuessData = await UserPoints.findOneAndUpdate(
                { user_id: userId },
                {
                    user_id: userId,
                    username: username,
                    $setOnInsert: {
                        points: 0,
                        last_guess_date: null,
                        last_correct_guess_date: null,
                        streak: 0,
                        daily_character_id: null,
                        failed_attempts: 0,
                        hints_given: 0,
                        last_failed_guess_date: null
                    }
                },
                { upsert: true, new: true }
            );

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
            if (!userGuessData.daily_character_id || userGuessData.failed_attempts >= 6) {
                // Get random character using aggregation
                const randomCharacters = await DisneyCharacter.aggregate([
                    { $sample: { size: 1 } }
                ]);
                
                if (!randomCharacters || randomCharacters.length === 0) {
                    return message.reply('No Disney characters found in the database. Please contact an administrator.');
                }
                
                dailyCharacter = randomCharacters[0];

                // Reset user's state for the new character
                // Only reset streak if it's due to failed attempts, not if it's a new user
                const shouldResetStreak = userGuessData.failed_attempts >= 6;
                userGuessData = await UserPoints.findOneAndUpdate(
                    { user_id: userId },
                    {
                        daily_character_id: dailyCharacter._id,
                        last_guess_date: currentTime,
                        failed_attempts: 0,
                        hints_given: 0,
                        ...(shouldResetStreak && { streak: 0 }),
                        last_failed_guess_date: null,
                        last_correct_guess_date: null
                    },
                    { new: true }
                );
            } else {
                // Continue guessing the currently assigned daily character
                dailyCharacter = await DisneyCharacter.findById(userGuessData.daily_character_id);
                
                // If the character is not found (maybe deleted), assign a new one
                if (!dailyCharacter) {
                    const randomCharacters = await DisneyCharacter.aggregate([
                        { $sample: { size: 1 } }
                    ]);
                    
                    if (!randomCharacters || randomCharacters.length === 0) {
                        return message.reply('No Disney characters found in the database. Please contact an administrator.');
                    }
                    
                    dailyCharacter = randomCharacters[0];
                    
                    // Reset user's state for the new character but keep streak
                    userGuessData = await UserPoints.findOneAndUpdate(
                        { user_id: userId },
                        {
                            daily_character_id: dailyCharacter._id,
                            last_guess_date: currentTime,
                            failed_attempts: 0,
                            hints_given: 0,
                            last_failed_guess_date: null,
                            last_correct_guess_date: null
                        },
                        { new: true }
                    );
                }
            }

            // Ensure dailyCharacter exists and has required properties
            if (!dailyCharacter) {
                return message.reply('Unable to load character data. Please try again.');
            }

            const dailyCharacterHints = Array.isArray(dailyCharacter.hints) ? dailyCharacter.hints : [];

            // --- 6. Guess Logic ---
            if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                // --- Correct Guess ---
                const streak = userGuessData.streak + 1;
                const pointsEarned = [50, 40, 30, 20, 10, 5][userGuessData.failed_attempts] || 0;
                const newPoints = (userGuessData.points || 0) + pointsEarned;

                await UserPoints.findOneAndUpdate(
                    { user_id: userId },
                    {
                        last_guess_date: currentTime,
                        last_correct_guess_date: currentTime,
                        streak: streak,
                        points: newPoints,
                        failed_attempts: 0,
                        daily_character_id: null,
                        hints_given: 0
                    }
                );

                const embed = new EmbedBuilder()
                    .setTitle('🎉 Correct Guess! 🎉')
                    .setDescription(
                        `You guessed **${dailyCharacter.name}** correctly, from **${dailyCharacter.series_film}**!\n` +
                        `You earned **${pointsEarned}** points!\n` +
                        `Your current correct guesses streak: **${streak}**\n` +
                        `Your total points: **${newPoints}**`
                    )
                    .setImage(dailyCharacter.image)
                    .setColor(0x78f06a);

                await message.channel.send({ embeds: [embed] });

                // --- Check for Disney achievements ---
                try {
                    console.log(`=== ACHIEVEMENT DEBUG ===`);
                    console.log(`User ID: ${userId}`);
                    console.log(`New Points: ${newPoints}`);
                    console.log(`Calling checkDisneyAchievements...`);
                    
                    const newAchievementIds = await checkDisneyAchievements(userId, newPoints);
                    console.log(`Returned achievements:`, newAchievementIds);
                    
                    if (newAchievementIds.length > 0) {
                        console.log(`Processing ${newAchievementIds.length} new achievements...`);
                        for (const achievementId of newAchievementIds) {
                            // Find the full achievement data
                            const achievement = allAchievements.find(a => a.id === achievementId);
                            console.log(`Achievement data for ${achievementId}:`, achievement);
                            
                            if (achievement) {
                                const achievementEmbed = new EmbedBuilder()
                                    .setTitle('🏆 Achievement Unlocked! 🏆')
                                    .setDescription(`**${achievement.name}**\n*${achievement.description}*`)
                                    .setColor(0xFFD700)
                                    .addFields({
                                        name: 'Rarity',
                                        value: `${achievement.emoji} ${achievement.rarity} points`,
                                        inline: true
                                    })
                                    .setFooter({ text: 'Congratulations! Keep playing to unlock more achievements!' });

                                await message.channel.send({ embeds: [achievementEmbed] });
                                console.log(`Sent achievement embed for ${achievementId}`);
                            } else {
                                console.log(`No achievement data found for ${achievementId}`);
                            }
                        }
                    } else {
                        console.log(`No new achievements to process`);
                    }
                } catch (achievementError) {
                    console.error('Error checking achievements:', achievementError);
                }

            } else {
                // --- Incorrect Guess ---
                const failedAttempts = userGuessData.failed_attempts + 1;

                if (failedAttempts < 6) {
                    const hintsGiven = Math.min(failedAttempts, dailyCharacterHints.length);

                    await UserPoints.findOneAndUpdate(
                        { user_id: userId },
                        {
                            failed_attempts: failedAttempts,
                            hints_given: hintsGiven,
                            last_guess_date: currentTime
                        }
                    );

                    // Safely get hints
                    let hintsText = 'No hints available yet! Try guessing again to reveal one.';
                    if (hintsGiven > 0 && dailyCharacterHints.length > 0) {
                        const availableHints = dailyCharacterHints.slice(0, hintsGiven);
                        hintsText = availableHints.length > 0 ? availableHints.join('\n') : 'No hints available for this character.';
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('❌ Incorrect Guess! Try Again!')
                        .setDescription(
                            `That's not it! You've made **${failedAttempts}** incorrect guess(es) for today's character.`
                        )
                        .setColor(0xf06a6a)
                        .addFields({
                            name: 'Hints',
                            value: hintsText,
                        });

                    message.channel.send({ embeds: [embed] });

                } else {
                    // Reset streak when user fails completely
                    await UserPoints.findOneAndUpdate(
                        { user_id: userId },
                        {
                            daily_character_id: null,
                            failed_attempts: 0,
                            hints_given: 0,
                            streak: 0, // Reset streak on complete failure
                            last_failed_guess_date: currentTime
                        }
                    );

                    const correctCharacterName = dailyCharacter.name;
                    const correctCharacterFilm = dailyCharacter.series_film;
                    
                    message.reply(
                        `You've run out of hints. The character was **${correctCharacterName}** from **${correctCharacterFilm}**.\n` +
                        `Your streak has been reset. You can try guessing a **new** character after a short cooldown.`
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
    try {
        const character = await DisneyCharacter.findOne({ 
            name: { $regex: new RegExp(`^${guessedCharacter}$`, 'i') } 
        });
        return character !== null;
    } catch (error) {
        console.error('Error validating character:', error);
        return false;
    }
}