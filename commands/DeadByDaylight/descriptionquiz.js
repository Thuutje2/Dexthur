const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'descriptionquiz',
    description: 'Description Quiz',
    aliases: ['dq'],
    async execute(message) {
        const survivors = survivorInformation.survivors;

        // Randomly choose a survivor and their perk
        const randomSurvivor = survivors[Math.floor(Math.random() * survivors.length)];
        const randomPerk = randomSurvivor.perks[Math.floor(Math.random() * randomSurvivor.perks.length)];

        const embed = new EmbedBuilder()
            .setTitle('Perk Quiz')
            .setColor(0x98fb98);

        // Pad naar de perk-afbeelding
        const imagePath = path.join(__dirname, randomPerk.image);

        if (!fs.existsSync(imagePath)) {
            return message.channel.send(`Afbeelding niet gevonden voor perk: ${randomPerk.name}`);
        }

        // Laad de perk-afbeelding als bijlage
        const perkAttachment = new AttachmentBuilder(imagePath);

        // Stel de beschrijving in voor de vraag
        embed.setDescription(`Wat is de naam van deze perk?`);
        await message.channel.send({ embeds: [embed], files: [perkAttachment] });

        // Filter om te controleren of de reactie van de oorspronkelijke afzender is
        const filter = response => response.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 180000 }); // 3 minuten

        collector.on('collect', response => {
            if (response.content.toLowerCase() === randomPerk.name.toLowerCase()) {
                message.channel.send('Correct!');
                collector.stop(); // Stop de collector bij correcte antwoord
            } else {
                message.channel.send(`Onjuist! Probeer het opnieuw.`);
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.channel.send("De tijd is om!");
            }
        });
    }
};
