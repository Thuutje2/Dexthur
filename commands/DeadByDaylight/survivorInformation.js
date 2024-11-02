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
            const survivor = args.join(' ').toLowerCase();
            const survivorData = survivorInformation.survivors.find(s => s.name.toLowerCase() === survivor);

            if (!survivorData) {
                return message.channel.send(`No information found for survivor: ${survivor}`);
            }

            const { name, gender, role, origin, cost, image, perks } = survivorData;

            // Pad naar de survivor-afbeelding
            const imagePath = path.join(__dirname, image);

            if (!fs.existsSync(imagePath)) {
                return message.channel.send(`Image not found for survivor: ${survivor}`);
            }

            // Laad de survivor-afbeelding als bijlage
            const survivorAttachment = new AttachmentBuilder(imagePath);

            // Maak een embed met de survivor thumbnail en de gecombineerde perks afbeelding
            const embed = new EmbedBuilder()
                .setTitle(name)
                .setThumbnail('attachment://' + path.basename(imagePath))
                .setDescription(`**Gender:** ${gender}\n**Role:** ${role}\n**Origin:** ${origin}\n**Cost:** ${cost}`)
                .setImage('attachment://perks.png')
                .setColor(0xf0c0e3);

            // Voeg de perk-beschrijvingen toe aan de embed
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







