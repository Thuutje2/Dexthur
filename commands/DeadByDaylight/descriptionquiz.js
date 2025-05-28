const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const survivorInformation = require('./json/DeadByDaylight.json');
const { handleForfeit } = require('../../utils/handleForfeit.js');

module.exports = {
  name: 'descriptionquiz',
  description: 'Description Quiz',
  aliases: ['dq'],
  async execute(message) {
    const survivors = survivorInformation.survivors;

    // Randomly choose a survivor and their perk
    const randomSurvivor =
      survivors[Math.floor(Math.random() * survivors.length)];
    const randomPerk =
      randomSurvivor.perks[
        Math.floor(Math.random() * randomSurvivor.perks.length)
      ];

    const embed = new EmbedBuilder()
      .setTitle('Description Quiz')
      .setColor(0x98fb98);

    // Path to the perk image
    const imagePath = path.join(__dirname, randomPerk.image);

    if (!fs.existsSync(imagePath)) {
      return message.channel.send(
        `Image not found for perk: ${randomPerk.name}`
      );
    }

    // Load the perk image as an attachment
    const perkAttachment = new AttachmentBuilder(imagePath);

    // Set the description for the question
    embed.setDescription(
      `What is the name of this perk?\n\n**Description:**\n${randomPerk.description}`
    );
    await message.channel.send({ embeds: [embed] });

    // Filter to check if the response is from the original sender
    const filter = (response) => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({
      filter,
      time: 180000,
    }); // 3 minutes

    collector.on('collect', (response) => {
      if (handleForfeit(response, collector, randomPerk.name)) return;
      if (response.content.toLowerCase() === randomPerk.name.toLowerCase()) {
        message.channel.send('Correct!');
        collector.stop(); // Stop the collector when answered correctly
      } else {
        message.channel.send(`Incorrect! Try again.`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        message.channel.send(
          "Time's up! The correct perk was: " + randomPerk.name
        );
      }
    });
  },
};
