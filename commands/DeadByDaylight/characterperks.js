const axios = require('axios');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'characterperks',
    description: 'Dead By Daylight perks',
    aliases: ['cp'],
    async execute(message, args) {
        // Controleer of een naam is meegegeven
        if (!args.length) {
            return message.channel.send('Geef de naam van een karakter op, bijvoorbeeld: !perks Dwight');
        }

        const characterName = args.join(' ').toLowerCase();

        try {
            // Maak een verzoek naar de API voor karakters
            const response = await axios.get('https://dbd.tricky.lol/api/characters');
            const characters = response.data;

            // Zoek naar het karakter op basis van de naam
            const character = Object.values(characters).find(char => char.name.toLowerCase() === characterName);

            if (!character) {
                return message.channel.send(`Geen karakter gevonden met de naam: ${characterName}`);
            }

            // Haal de perks op van de API
            const perksResponse = await axios.get('https://dbd.tricky.lol/api/perks');
            const perks = perksResponse.data;

            // Maak een embed voor de perks
            const embed = new EmbedBuilder()
                .setTitle(`${character.name}'s Perks`)
                .setDescription(`Hier zijn de perks van ${character.name}`)
                .setColor(0x0099FF);

            // Loop door de perk-namen en haal de details op
            character.perks.forEach(perkName => {
                const perk = perks[perkName]; // Haal de perk op met de naam

                // Verkrijg de bereikwaarden uit de tunables
                const tunableValues = perk.tunables.length > 0 ? perk.tunables : [[]];

                // Vervang de {0}, {1}, en {2} placeholders met de juiste waarden
                let descriptionWithPlaceholders = perk.description
                    .replace('{0}', `${tunableValues[0].map(value => `\`${value}\``).join(' / ')}`)
                    .replace('{1}', `${tunableValues[1] ? `\`${tunableValues[1]}\`` : ''}`) // Voeg backticks toe voor {1}
                    .replace('{2}', `${tunableValues[2] ? `\`${tunableValues[2]}\`` : ''}`) // Voeg backticks toe voor {2}
                    .replace('{3}', `${tunableValues[3] ? `\`${tunableValues[3]}\`` : ''}`) // Voeg backticks toe voor {3}
                    .replace('{4}', `${tunableValues[4] ? `\`${tunableValues[4]}\`` : ''}`) // Voeg backticks toe voor {4}
                    .replace('{5}', `${tunableValues[5] ? `\`${tunableValues[5]}\`` : ''}`)
                    .replace(/<br>/g, '\n') // Vervang <br> met nieuwe regel
                    .replace(/<li>/g, '\n• ') // Vervang <li> met een bullet point
                    .replace(/<\/li>/g, '') // Verwijder </li>
                    .replace(/<\/?b>/g, '**') // Vetgedrukte tekst
                    .replace(/<i>/g, '*') // Cursive text
                    .replace(/<\/i>/g, '*') // Cursive text
                    .replace(/<ul>/g, '') // Verwijder <ul>
                    .replace(/<\/ul>/g, ''); // Verwijder </ul>

                if (perk) {
                    const perkImageURL = `https://dbd.tricky.lol/${perk.image}`;
                    embed.addFields({
                        name: perk.name,
                        value: descriptionWithPlaceholders,
                        inline: true,
                        thumbnail: { url: perkImageURL },
                    });
                    embed.setImage(perkImageURL); // Zet het laatste afbeelding in de embed
                }
            });

            // Verstuur de embed met de perks
            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.channel.send('Er ging iets mis bij het ophalen van de karaktergegevens.');
        }
    }
};



