const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'perkInformation',
    description: 'Perk information for survivors and killers',
    aliases: ['perk'],
    async execute(message, args) {
        try {
            const perkName = args.join(' ').toLowerCase();
            let perkData = null;

            // Zoek in de perks van alle overlevenden
            for (const survivor of survivorInformation.survivors) {
                perkData = survivor.perks.find(p => p.name.toLowerCase() === perkName);
                if (perkData) break; // Stop de loop als de perk is gevonden
            }

            // Als de perk niet is gevonden bij overlevenden, zoek dan bij killers
            if (!perkData) {
                for (const killer of survivorInformation.killers) {
                    perkData = killer.perks.find(p => p.name.toLowerCase() === perkName);
                    if (perkData) break; // Stop de loop als de perk is gevonden
                }
            }

            if (!perkData) {
                return message.channel.send(`No information found for perk: ${perkName}`);
            }

            const { name, description, image } = perkData;

            // Pad naar de perk-afbeelding
            const imagePath = path.join(__dirname, image);

            if (!fs.existsSync(imagePath)) {
                return message.channel.send(`Image not found for perk: ${perkName}`);
            }

            // Laad de perk-afbeelding als bijlage
            const perkAttachment = new AttachmentBuilder(imagePath);

            // Maak een embed met de perk thumbnail
            const embed = new EmbedBuilder()
                .setTitle(name)
                .setThumbnail('attachment://' + path.basename(imagePath))
                .setDescription(description)
                .setColor(0xf0c0e3);

            // Stuur de embed met de perk-afbeelding
            message.channel.send({ embeds: [embed], files: [perkAttachment] });

        } catch (error) {
            console.error('An error occurred while getting information of the perk: ', error);
            message.channel.send('An error occurred while getting information of the perk.');
        }
    }
};
