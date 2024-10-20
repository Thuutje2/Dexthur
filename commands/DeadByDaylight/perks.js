const axios = require('axios');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'perks',
    description: 'Toon de afbeelding van een specifieke perk',
    aliases: ['perk'],
    async execute(message, args) {
        // Controleer of er een naam is meegegeven
        if (!args.length) {
            return message.channel.send('Geef de naam van een perk op, bijvoorbeeld: !perk Bond');
        }

        const perkName = args.join(' ').toLowerCase();

        try {
            // Maak een verzoek naar de API voor perks
            const perksResponse = await axios.get('https://dbd.tricky.lol/api/perks');
            const perks = perksResponse.data;

            console.log('API response:', perks); // Log de API-respons

            // Zoek naar de perk op basis van de naam
            const perk = Object.values(perks).find(p => p.name.toLowerCase() === perkName);

            if (!perk) {
                return message.channel.send(`Geen perk gevonden met de naam: ${perkName}`);
            }

            // Zorg ervoor dat de image URL geldig is
            const baseImageUrl = 'https://dbd.tricky.lol/';
            const perkImageURL = `${baseImageUrl}${perk.image}`;

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


            // Maak een embed voor de perk afbeelding
            const embed = new EmbedBuilder()
                .setTitle(perk.name)
                .setDescription(descriptionWithPlaceholders)
                .setColor(0x0099FF);

            // Verstuur de embed met de perk afbeelding
            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.channel.send('Er ging iets mis bij het ophalen van de perkgegevens.');
        }
    }
};












