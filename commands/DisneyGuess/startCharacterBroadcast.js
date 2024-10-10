const { query } = require('../../database');

let currentCharacter = null;
let characterChannelId = null;
let characterStartTime = null; // Tijdstip waarop het karakter is verzonden

const startCharacterBroadcast = (client) => {
    setInterval(async () => {
        try {
            // Controleer of er al een karakter is en of het 15 minuten geleden is verzonden
            if (currentCharacter && characterStartTime) {
                const currentTime = new Date();
                const timeElapsed = currentTime - characterStartTime;

                // Als 15 minuten zijn verstreken, reset het karakter
                if (timeElapsed >= 15 * 60 * 1000) {
                    currentCharacter = null; // Reset het huidige karakter
                }
            }

            // Kies een willekeurig Disney-character als er geen actief karakter is
            if (!currentCharacter) {
                const characterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
                currentCharacter = characterResult.rows[0];
                characterStartTime = new Date(); // Stel de starttijd in

                if (characterChannelId) {
                    const channel = client.channels.cache.get(characterChannelId);
                    if (channel) {
                        channel.send(`Nieuw Disney character! Raad de naam in de chat met ! gevolgd door de naam!`);
                    }
                }
            }
        } catch (error) {
            console.error('Er is een fout opgetreden bij het ophalen van het character:', error);
        }
    }, 60 * 1000); // Controleer elke minuut
};


// Voeg een methode toe om de channel ID in te stellen waar het character moet worden verzonden
const setCharacterChannel = (channelId) => {
    characterChannelId = channelId;
};

const checkGuess = async (message) => {
    if (message.author.bot || !currentCharacter) return; // Negeer bot-berichten en als er geen character is

    const guessedCharacter = message.content.slice(1).trim().toLowerCase();

    if (guessedCharacter === currentCharacter.name.toLowerCase()) {
        // Voeg hier de logica toe om punten toe te kennen aan de gebruiker die correct raadt
        const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);

        if (userResult.rowCount > 0) {
            const userGuessData = userResult.rows[0];
            const newPoints = (userGuessData.points || 0) + 20; // Stel hier het aantal punten in

            await query('UPDATE User_Points SET points = $1 WHERE user_id = $2', [newPoints, message.author.id]);

            message.channel.send(`${message.author.username} heeft het juiste karakter geraden: **${currentCharacter.name}**! Je hebt 20 punten verdiend!`);

            // Reset het huidige karakter
            currentCharacter = null;
            characterStartTime = null; // Reset de starttijd
        }
    } else {
        // Als het verkeerd is geraden, haal de hints op
        const userResult = await query('SELECT * FROM User_Points WHERE user_id = $1', [message.author.id]);

        if (userResult.rowCount > 0) {
            const userGuessData = userResult.rows[0];
            const failedAttempts = (userGuessData.failed_attempts || 0) + 1; // Verhoog mislukte pogingen met 1

            // Haal het dagelijkse karakter op om hints te krijgen
            const characterResult = await query('SELECT * FROM disney_characters WHERE id = $1', [userGuessData.daily_character_id]);
            const dailyCharacter = characterResult.rows[0];

            if (dailyCharacter) {
                const hints = dailyCharacter.hints.split(';'); // Neem aan dat hints gescheiden zijn door een puntkomma
                const hintsGiven = Math.min(failedAttempts, hints.length); // Beperk hints tot het aantal beschikbare hints

                await query('UPDATE User_Points SET failed_attempts = $1 WHERE user_id = $2', [failedAttempts, message.author.id]);

                if (failedAttempts < 6) {
                    // Geef hints als het aantal mislukte pogingen minder is dan 6
                    const embed = new EmbedBuilder()
                        .setTitle('Raad het Disney karakter')
                        .setDescription('Raad het karakter!')
                        .setColor(0xc56af0)
                        .addFields({ name: 'Hints', value: hints.slice(0, hintsGiven).join('\n') });

                    message.channel.send({ embeds: [embed] });
                } else {
                    // Reset de streak en meld dat er geen hints meer zijn
                    await query('UPDATE User_Points SET daily_character_id = null, streak = 0 WHERE user_id = $1', [message.author.id]);
                    message.reply(`Helaas, je hebt geen hints meer. Het karakter was **${currentCharacter.name}**. Probeer een nieuw karakter te raden morgen.`);

                    // Reset het huidige karakter
                    currentCharacter = null;
                    characterStartTime = null;
                }
            }
        }
    }
};


const sendNewCharacter = async (client) => {
    if (!currentCharacter) {
        const characterResult = await query('SELECT * FROM disney_characters ORDER BY RANDOM() LIMIT 1');
        currentCharacter = characterResult.rows[0];
        characterStartTime = new Date(); // Stel de starttijd in

        if (characterChannelId) {
            const channel = client.channels.cache.get(characterChannelId);
            if (channel) {
                channel.send(`Nieuw Disney character! Raad de naam in de chat met ! gevolgd door de naam!`);
            }
        }
    }
};



// Exporteer de functies
module.exports = {
    startCharacterBroadcast,
    setCharacterChannel,
    checkGuess,
    sendNewCharacter
};

