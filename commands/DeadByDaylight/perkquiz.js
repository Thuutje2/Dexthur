const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const survivorInformation = require('./json/DeadByDaylight.json');

module.exports = {
    name: 'perkquiz',
    description: 'Perk Quiz',
    async execute(message) {
        const survivors = survivorInformation.survivors;

        // Randomly choose a question type
        const questionType = Math.random() < 0.5 ? 'perk' : 'survivor';

        // Select a random survivor and their perk
        const randomSurvivor = survivors[Math.floor(Math.random() * survivors.length)];
        const randomPerk = randomSurvivor.perks[Math.floor(Math.random() * randomSurvivor.perks.length)];

        const embed = new EmbedBuilder()
            .setTitle('Perk Quiz')
            .setColor(0x98fb98);

        // Pad naar de perk-afbeelding
        const imagePath = path.join(__dirname, randomPerk.image);

        if (!fs.existsSync(imagePath)) {
            return message.channel.send(`Image not found for perk: ${randomPerk.name}`);
        }

        // Laad de perk-afbeelding als bijlage
        const perkAttachment = new AttachmentBuilder(imagePath);

        if (questionType === 'perk') {
            embed.setDescription(`What is the name of this perk?`);
            message.channel.send({ embeds: [embed], files: [perkAttachment] });

            const filter = response => response.author.id === message.author.id;
            const collector = message.channel.createMessageCollector({ filter, time: 180000 }); // 3 minutes in milliseconds

            collector.on('collect', response => {
                if (response.content.toLowerCase() === randomPerk.name.toLowerCase()) {
                    message.channel.send('Correct!');
                    collector.stop(); // Stop the collector when answered correctly
                } else {
                    message.channel.send(`Incorrect! Try again.`);
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    message.channel.send("Time's up!");
                }
            });

        } else { // Survivor question
            embed.setDescription(`Who has this perk?`);
            message.channel.send({ embeds: [embed], files: [perkAttachment] });

            const filter = response => response.author.id === message.author.id;
            const collector = message.channel.createMessageCollector({ filter, time: 180000 }); // 3 minutes in milliseconds

            collector.on('collect', response => {
                // Controleer op voornaam of achternaam, ongeacht hoofdletters
                const userResponse = response.content.toLowerCase();
                const fullName = randomSurvivor.name.toLowerCase();
                const nameParts = fullName.split(' ');

                // Check of de gebruiker de voornaam of achternaam correct heeft
                if (nameParts.includes(userResponse)) {
                    message.channel.send('Correct!');
                    collector.stop(); // Stop the collector when answered correctly
                } else {
                    message.channel.send(`Incorrect! Try again.`);
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    message.channel.send("Time's up!");
                }
            });
        }
    }
};






