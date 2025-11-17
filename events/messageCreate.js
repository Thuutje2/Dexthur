const { handleXP } = require('../utils/xpLevelSystemUtils');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    try {
      const { userData, leveledUp, xpGain } = await handleXP(
        message.author.id,
        message.guild.id
      );

      if (leveledUp) {
        const levelupMessages = [
          `🐱 Paws up for ${message.author}! You’ve reached level ${userData.level}! Time for a cozy catnap in the cave. 💤`,
          `😸 Me-wow, ${message.author}! Level ${userData.level} achieved — your whiskers are practically glowing! ✨`,
          `🐾 ${message.author} just leveled up to ${userData.level}! The cats are purring in approval. 💕`,
          `🐈 ${message.author}, you’ve climbed to level ${userData.level}! A soft blanket and a warm purr await you. 🐾`,
          `🌙 ${message.author} reached level ${userData.level}! Curl up and enjoy the moonlight like a true cave cat. 🌌`,
          `🐼 Big bear hugs for ${message.author}! Level ${userData.level} unlocked — bamboo snacks for everyone! 🎋`,
          `🥢 ${message.author}, you reached level ${userData.level}! The panda elders nod in cozy approval. 💤`,
          `🍃 ${message.author} leveled up to ${userData.level}! Time to roll around and celebrate panda-style! 🎉`,
          `🌸 ${message.author}, your calm panda spirit has reached level ${userData.level}! Serenity and snacks await. 🍪`,
          `🐾 ${message.author} is now level ${userData.level}! The bamboo grove echoes with gentle applause. 🎋`,
        ];

        const randomMessage =
          levelupMessages[Math.floor(Math.random() * levelupMessages.length)];

        let levelupChannel = message.guild.channels.cache.find(
          (ch) => ch.type === 0 && ch.name.toLowerCase() === 'levelup'
        );
        if (levelupChannel) {
          await levelupChannel.send(randomMessage);
        } else {
          try {
            levelupChannel = await message.guild.channels.create({
              name: 'levelup',
              type: 0,
              reason: 'Channel for level up announcements',
            });
            await levelupChannel.send(randomMessage);
          } catch (createErr) {
            await message.channel.send(randomMessage);
            console.error('Could not create #levelup channel:', createErr);
          }
        }
      }
    } catch (error) {
      console.error('Error handling message XP:', error);
    }

    // Handle commands
    const prefix = process.env.PREFIX;
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (command) {
      try {
        await command.execute(message, args, client);
      } catch (error) {
        console.error(`Error executing command "${commandName}":`, error);
        message.reply('There was an error executing the command.');
      }
    }
  },
};
