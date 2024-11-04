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

            // Filter survivors safely, ensuring each item and its name property exists
            const matchingSurvivors = survivorInformation.survivors.filter(s =>
                    s && s.name && (
                        s.name.toLowerCase() === survivorInput ||
                        s.name.toLowerCase().startsWith(survivorInput) ||
                        s.name.toLowerCase().endsWith(survivorInput)
                    )
            );

            if (matchingSurvivors.length === 0) {
                return message.channel.send(`No information found for survivor: ${survivorInput}`);
            } else if (matchingSurvivors.length > 1) {
                const survivorNames = matchingSurvivors.map(s => s.name).join(', ');
                return message.channel.send(`Multiple survivors found: ${survivorNames}. Please specify the full name.`);
            }

            // Use the only match left
            const survivorData = matchingSurvivors[0];
            const { name, gender, role, origin, image, perks } = survivorData;

            // Path to the survivor image
            const imagePath = path.join(__dirname, image);

            if (!fs.existsSync(imagePath)) {
                return message.channel.send(`Image not found for survivor: ${name}`);
            }

            // Load the survivor image as an attachment
            const survivorAttachment = new AttachmentBuilder(imagePath);

            // Create an embed with the survivor thumbnail and the combined perks image
            const embed = new EmbedBuilder()
                .setTitle(name)
                .setThumbnail('attachment://' + path.basename(imagePath))
                .setDescription(`**Gender:** ${gender}\n**Role:** ${role}\n**Origin:** ${origin}`)
                .setImage('attachment://perks.png')
                .setColor(0xf0c0e3);

            // Add perk descriptions to the embed
            perks.forEach(perk => {
                embed.addFields({ name: perk.name, value: perk.description });
            });

            // Send the embed with both the survivor and combined perks images
            message.channel.send({ embeds: [embed], files: [survivorAttachment] });

        } catch (error) {
            console.error('An error occurred while getting information of the survivor: ', error);
            message.channel.send('An error occurred while getting information of the survivor.');
        }
    }
};








