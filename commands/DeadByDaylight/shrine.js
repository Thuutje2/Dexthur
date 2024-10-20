const axios = require('axios');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'shrine',
    description: 'Toont de huidige shrine perks in Dead By Daylight',
    async execute(message) {
        try {
            // Maak een verzoek naar de API voor de shrine perks
            const response = await axios.get('https://dbd.tricky.lol/api/shrine');
            const shrine = response.data;

            console.log('API response:', shrine); // Log de API-respons

            // Controleer of de response perks bevat
            if (!shrine.perks || !Array.isArray(shrine.perks) || shrine.perks.length === 0) {
                return message.channel.send('Er ging iets mis bij het ophalen van de shrine perks. Geen perks gevonden.');
            }

            // Maak een embed voor de shrine perks
            const embed = new EmbedBuilder()
                .setTitle('🛕 Dead By Daylight Shrine Perks 🛕')
                .setDescription('Hier zijn de huidige shrine perks:')
                .setColor(0x0099FF);

            // Loop door de shrine perks en haal de details op
            let perkFields = []; // Array om perk velden tijdelijk op te slaan

            for (const perk of shrine.perks) {
                try {
                    // Maak een verzoek naar de API voor elke perk om details op te halen
                    const perkResponse = await axios.get(`https://dbd.tricky.lol/api/perkinfo?perk=${perk.id}`);
                    const perkDetails = perkResponse.data;
                    console.log('Perk details:', perkDetails); // Log de perk details

                    // Genereer de afbeelding URL voor de perk
                    const perkImageURL = `https://dbd.tricky.lol/dbdassets/perks/${perkDetails.image.split('/').pop()}`;

                    // Verkrijg de bereikwaarden uit de tunables
                    const tunableValues = perkDetails.tunables.length > 0 ? perkDetails.tunables : [[]];

                    // Vervang de {0}, {1}, en {2} placeholders met de juiste waarden
                    let descriptionWithPlaceholders = perkDetails.description
                        .replace('{0}', `${tunableValues[0].map(value => `\`${value}\``).join(' / ')}`)
                        .replace('{1}', `${tunableValues[1] ? `\`${tunableValues[1]}\`` : ''}`)
                        .replace('{2}', `${tunableValues[2] ? `\`${tunableValues[2]}\`` : ''}`)
                        .replace('{3}', `${tunableValues[3] ? `\`${tunableValues[3]}\`` : ''}`)
                        .replace('{4}', `${tunableValues[4] ? `\`${tunableValues[4]}\`` : ''}`)
                        .replace('{5}', `${tunableValues[5] ? `\`${tunableValues[5]}\`` : ''}`)
                        .replace(/<br>/g, '\n') // Vervang <br> met nieuwe regel
                        .replace(/<li>/g, '\n• ') // Vervang <li> met een bullet point
                        .replace(/<\/li>/g, '') // Verwijder </li>
                        .replace(/<\/?b>/g, '**') // Vetgedrukte tekst
                        .replace(/<i>/g, '*') // Cursive text
                        .replace(/<\/i>/g, '*') // Cursive text
                        .replace(/<ul>/g, '') // Verwijder <ul>
                        .replace(/<\/ul>/g, ''); // Verwijder </ul>

                    // Voeg de perk details toe aan de array van velden
                    perkFields.push({
                        name: perkDetails.name,
                        value: descriptionWithPlaceholders,
                    });

                } catch (error) {
                    console.error(`Fout bij het ophalen van perk details voor ID ${perk.id}:`, error);
                    continue; // Ga verder met de volgende perk als er een fout optreedt
                }
            }

            // Voeg de velden toe aan de embed in batches van 2
            for (let i = 0; i < perkFields.length; i += 2) {
                embed.addFields(perkFields.slice(i, i + 2)); // Voeg de volgende 2 velden toe
            }

            // Verstuur de embed met de shrine perks
            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.channel.send('Er ging iets mis bij het ophalen van de shrine perkgegevens.');
        }
    }
};








