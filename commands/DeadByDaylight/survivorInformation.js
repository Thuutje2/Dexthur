const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'survivorInformation',
    description: 'Survivor information',
    aliases: ['survivor', 'surv'],
    async execute(message, args) {
        try {
            const survivorInput = args.join(' ').toLowerCase();

            // Filter survivors veilig, en controleer of 'name' een string of array is
            const matchingSurvivors = survivorInformation.survivors.filter(s => {
                if (!s || !s.name) return false;

                if (Array.isArray(s.name)) {
                    // Controleer of een van de namen in de array overeenkomt met de input
                    return s.name.some(n => n.toLowerCase() === survivorInput ||
                        n.toLowerCase().startsWith(survivorInput) ||
                        n.toLowerCase().endsWith(survivorInput));
                } else {
                    // Gebruik de reguliere string-matching logica voor een enkele naam
                    return s.name.toLowerCase() === survivorInput ||
                        s.name.toLowerCase().startsWith(survivorInput) ||
                        s.name.toLowerCase().endsWith(survivorInput);
                }
            });

            if (matchingSurvivors.length === 0) {
                return message.channel.send(`No information found for survivor: ${survivorInput}`);
            } else if (matchingSurvivors.length > 1) {
                const survivorNames = matchingSurvivors.map(s => Array.isArray(s.name) ? s.name.join(', ') : s.name).join(', ');
                return message.channel.send(`Multiple survivors found: ${survivorNames}. Please specify the full name.`);
            }

            // Gebruik de enige overgebleven match
            const survivorData = matchingSurvivors[0];
            const { name, gender, role, origin, image, perks } = survivorData;

            // Pad naar de survivor-afbeelding
            const imagePath = path.join(__dirname, image);

            if (!fs.existsSync(imagePath)) {
                return message.channel.send(`Image not found for survivor: ${Array.isArray(name) ? name.join(', ') : name}`);
            }

            // Laad de survivor-afbeelding als een attachment
            const survivorAttachment = new AttachmentBuilder(imagePath);

            // Maak een embed met de survivor-thumbnail en de gecombineerde perks-afbeelding
            const embed = new EmbedBuilder()
                .setTitle(Array.isArray(name) ? name.join(', ') : name)  // Toon alle namen als er meerdere zijn
                .setThumbnail('attachment://' + path.basename(imagePath))
                .setDescription(`**Gender:** ${gender}\n**Role:** ${role}\n**Origin:** ${origin}`)
                .setImage('attachment://perks.png')
                .setColor(0xf0c0e3);

            // Voeg perk-beschrijvingen toe aan de embed
            perks.forEach(perk => {
                embed.addFields({ name: perk.name, value: perk.description });
            });

            // Stuur de embed met zowel de survivor- als gecombineerde perks-afbeeldingen
            message.channel.send({ embeds: [embed], files: [survivorAttachment] });

        } catch (error) {
            console.error('An error occurred while getting information of the survivor: ', error);
            message.channel.send('An error occurred while getting information of the survivor.');
        }
    }
};









