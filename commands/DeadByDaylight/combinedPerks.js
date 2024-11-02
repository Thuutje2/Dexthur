const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'combinedPerks',
    description: 'Combine three perks into one image',
    aliases: ['combinePerks'],
    async execute(message, args) {
        try {
            const survivorName = args.join(' ').toLowerCase();
            const survivorData = survivorInformation.survivors.find(s => s.name.toLowerCase() === survivorName);

            if (!survivorData) {
                return message.channel.send(`No information found for survivor: ${survivorName}`);
            }

            const { perks } = survivorData;

            // Controleer of er precies 3 perks zijn
            if (perks.length < 3) {
                return message.channel.send('This survivor does not have enough perks.');
            }

            // Laad de perk-afbeeldingen
            const perkImages = [];
            for (const perk of perks.slice(0, 3)) { // Neem alleen de eerste 3 perks
                const perkImagePath = path.join(__dirname, perk.image);
                try {
                    const img = await loadImage(perkImagePath);
                    perkImages.push(img);
                } catch (error) {
                    console.error(`Error loading perk image: ${perkImagePath} ${error}`);
                }
            }

            // Stel de canvas-grootte in (bijv. breedte = 3 * 256, hoogte = 256)
            const canvasWidth = 3 * 256; // 3 perks naast elkaar
            const canvasHeight = 256; // Hoogte van de afbeelding
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            // Teken de perk-afbeeldingen naast elkaar
            perkImages.forEach((img, index) => {
                ctx.drawImage(img, index * 256, 0, 256, 256);
            });

            // Exporteer de canvas als een buffer en maak een bijlage voor de gecombineerde perks
            const perkAttachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'combinedPerks.png' });

            // Maak een embed met de gecombineerde perks afbeelding
            const embed = new EmbedBuilder()
                .setTitle(`Combined Perks for ${survivorData.name}`)
                .setImage('attachment://combinedPerks.png')
                .setColor(0xf0c0e3);

            // Stuur de embed met de gecombineerde perks-afbeelding
            message.channel.send({ embeds: [embed], files: [perkAttachment] });

        } catch (error) {
            console.error('An error occurred while combining perks: ', error);
            message.channel.send('An error occurred while combining perks.');
        }
    }
};
