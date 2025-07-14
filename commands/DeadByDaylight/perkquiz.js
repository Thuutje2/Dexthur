const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const survivorInformation = require('./json/DeadByDaylight.json');
const { handleForfeit } = require('../../utils/handleForfeit.js');
const { addXp } = require('../../utils/xpManager');
const dbdQuizManager = require('../../utils/dbdQuizManager');

module.exports = {
  name: 'perkquiz',
  description: 'Perk Quiz',
  aliases: ['pq'],
  async execute(message) {
    const userId = message.author.id;
    const channelId = message.channel.id;

    // Check if user already has an active DBD quiz
    if (dbdQuizManager.hasActiveQuiz(userId)) {
      const activeQuiz = dbdQuizManager.getActiveQuiz(userId);
      return message.channel.send(
        `❌ You already have an active **${activeQuiz.type}** quiz running! Please finish it before starting a new one.`
      );
    }

    // Start the quiz session
    if (!dbdQuizManager.startQuiz(userId, 'Perk Quiz', channelId)) {
      return message.channel.send('❌ Failed to start quiz. Please try again.');
    }

    const survivors = survivorInformation.survivors;

    // Randomly choose a question type
    const questionType = Math.random() < 0.5 ? 'perk' : 'survivor';

    // Select a random survivor and their perk
    const randomSurvivor =
      survivors[Math.floor(Math.random() * survivors.length)];
    const randomPerk =
      randomSurvivor.perks[
        Math.floor(Math.random() * randomSurvivor.perks.length)
      ];

    const embed = new EmbedBuilder().setTitle('Perk Quiz').setColor(0x98fb98);

    // Pad naar de perk-afbeelding
    const imagePath = path.join(__dirname, randomPerk.image);

    if (!fs.existsSync(imagePath)) {
      dbdQuizManager.endQuiz(userId); // Clean up session if image not found
      return message.channel.send(
        `Image not found for perk: ${randomPerk.name}`
      );
    }

    // Laad de perk-afbeelding als bijlage
    const perkAttachment = new AttachmentBuilder(imagePath);

    if (questionType === 'perk') {
      embed.setDescription(`What is the name of this perk?`);
      message.channel.send({ embeds: [embed], files: [perkAttachment] });

      const filter = (response) => response.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({
        filter,
        time: 180000,
      }); // 3 minutes in milliseconds

      collector.on('collect', async (response) => {
        if (handleForfeit(response, collector, randomPerk.name)) {
          dbdQuizManager.endQuiz(userId); // End session on forfeit
          return;
        }
        if (response.content.toLowerCase() === randomPerk.name.toLowerCase()) {
          message.channel.send('Correct!');
          await addXp(message, message.author.id);
          collector.stop();
          dbdQuizManager.endQuiz(userId); // End the quiz session on correct answer
        } else {
          message.channel.send(`Incorrect! Try again.`);
        }
      });

      collector.on('end', (collected, reason) => {
        dbdQuizManager.endQuiz(userId); // Always clean up session when collector ends
        if (reason === 'time') {
          message.channel.send("Time's up!");
        }
      });
    } else {
      embed.setDescription(`Who has this perk?`);
      message.channel.send({ embeds: [embed], files: [perkAttachment] });

      const filter = (response) => response.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({
        filter,
        time: 180000,
      });

      collector.on('collect', async (response) => {
        if (handleForfeit(response, collector, randomSurvivor.name)) {
          dbdQuizManager.endQuiz(userId); // End session on forfeit
          return;
        }

        const userResponse = response.content.toLowerCase();

        const validNames = Array.isArray(randomSurvivor.name)
          ? randomSurvivor.name.map((n) => n.toLowerCase())
          : [randomSurvivor.name.toLowerCase()];

        const allNameParts = validNames.flatMap((name) => name.split(' '));

        if (allNameParts.includes(userResponse)) {
          message.channel.send('Correct!');
          await addXp(message, message.author.id);
          collector.stop();
          dbdQuizManager.endQuiz(userId); // End the quiz session on correct answer
        } else {
          message.channel.send('Incorrect! Try again.');
        }
      });

      collector.on('end', (collected, reason) => {
        dbdQuizManager.endQuiz(userId); // Always clean up session when collector ends
        if (reason === 'time') {
          message.channel.send("Time's up!");
        }
      });
    }
  },
};
