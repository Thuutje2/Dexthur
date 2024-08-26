const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

// Variabelen om het huidige dagelijkse personage en de bijbehorende hints op te slaan
let dailyCharacter = null;
let dailyCharacterHints = [];
let lastCharacterSetTime = null;
let failedAttempts = 0; // Houd het aantal mislukte pogingen bij
let lastGuessDate = null; // Houd de laatste gokdatum bij
let streak = 0; // Houd de streak bij
const guessCooldown = 24 * 60 * 60 * 1000; // 24 uur in milliseconden

module.exports = {
    name: 'guess',
    description: 'Guess the Disney character.',
    async execute(message, args) {
        try {
            // Als er geen karakternaam is opgegeven, geef een foutmelding terug
            if (args.length === 0) {
                return message.reply('Gebruik: `!guess <karakternaam>` om een Disney-personage te raden.');
            }

            // Haal het geraden personage op uit de argumenten
            const guessedCharacter = args.join(' ').toLowerCase();

            // Controleer of de gebruiker al heeft geraden binnen de cooldown-periode
            const userGuess = await query('SELECT last_guess_date, streak FROM user_points WHERE user_id = $1', [message.author.id]);
            if (userGuess.rows.length > 0) {
                lastGuessDate = new Date(userGuess.rows[0].last_guess_date);
                streak = userGuess.rows[0].streak;
                const currentTime = new Date();
                const timeDifference = currentTime - lastGuessDate;
                if (timeDifference < guessCooldown) {
                    const timeRemaining = guessCooldown - timeDifference;
                    const remainingHours = Math.floor(timeRemaining / (1000 * 60 * 60));
                    const remainingMinutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                    return message.reply(`Try guessing a new character in ${remainingHours} hours and ${remainingMinutes} minutes.`);
                }
            }

            // Als er geen dagelijkse personage is ingesteld of als het tijd is om een nieuw dagelijks personage in te stellen
            if (!dailyCharacter || !lastCharacterSetTime || (new Date() - lastCharacterSetTime > guessCooldown)) {
                const dailyCharacterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
                dailyCharacter = dailyCharacterResult.rows[0];
                dailyCharacterHints = dailyCharacter.hints;
                lastCharacterSetTime = new Date();
                failedAttempts = 0; // Reset het aantal mislukte pogingen
            }

            // Controleer of het geraden personage correct is
            if (guessedCharacter === dailyCharacter.name.toLowerCase()) {
                // Update de laatste gokdatum en streak voor de gebruiker
                const currentTime = new Date();
                if (!lastGuessDate || (lastGuessDate.getDate() !== currentTime.getDate() - 1)) {
                    // De gebruiker heeft opnieuw gegokt na een dag pauze of na een pauze van meer dan één dag, reset de streak naar 1
                    streak = 1;
                } else {
                    // Dezelfde dag gegokt of de dag na de vorige gok, verhoog de streak met 1
                    streak++;
                }

                // Update de laatste gokdatum en streak voor de gebruiker in de database
                await query('UPDATE user_points SET last_guess_date = $1, streak = $2 WHERE user_id = $3', [currentTime, streak, message.author.id]);

                // Bereken de punten op basis van het aantal mislukte pogingen
                let pointsEarned = 0;
                switch (failedAttempts) {
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
                    default:
                        pointsEarned = 5;
                        break;
                }

                // Update de punten in de database voor de huidige gebruiker
                const userRow = await query('SELECT points FROM user_points WHERE user_id = $1', [message.author.id]);
                if (userRow.rows.length === 0) {
                    // Gebruiker is nieuw, dus voeg een nieuwe rij toe
                    await query('INSERT INTO user_points (user_id, username, points, last_guess_date, streak) VALUES ($1, $2, $3, $4, $5)', [message.author.id, message.author.username, pointsEarned, currentTime, streak]);
                } else {
                    const currentPoints = userRow.rows[0].points;
                    await query('UPDATE user_points SET points = $1 WHERE user_id = $2', [currentPoints + pointsEarned, message.author.id]);
                }

                const embed = new EmbedBuilder()
                    .setTitle('Correct Guess!')
                    .setDescription(`The character was ${dailyCharacter.name}.\nYou earned ${pointsEarned} points!\nStreak: ${streak}`)
                    .setImage(dailyCharacter.image);

                // Stuur het embed terug naar het kanaal
                message.channel.send({ embeds: [embed] });

            } else {
                // Verhoog het aantal mislukte pogingen
                failedAttempts++;

                if (failedAttempts <= 5) {
                    // Stel het embed op met de hints op basis van het aantal mislukte pogingen
                    const embed = new EmbedBuilder()
                        .setTitle('Guess the Disney Character')
                        .setDescription('Guess the character!')
                        .addFields({ name: 'Hints', value: dailyCharacterHints.slice(0, failedAttempts).join('\n') });

                    // Stuur het embed terug naar het kanaal
                    return message.channel.send({ embeds: [embed] });
                } else {
                    // Als het geraden personage incorrect is en de gebruiker geen hints meer heeft, laat de gebruiker door raden
                    return message.reply(`Unfortunately, you have run out of hints. The character was ${dailyCharacter.name}. Try guessing a new character tomorrow.`);
                }
            }

        } catch (error) {
            console.error('Er is een fout opgetreden bij het raden van het personage:', error);
            message.channel.send('An error occurred while guessing the character. Please try again later.');
        }
    }
};















