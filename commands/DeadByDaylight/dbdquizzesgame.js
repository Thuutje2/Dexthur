const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'dbdquizzesgame',
  description: 'Provides information about the Dead by Daylight Quizzes game.',
  aliases: ['dbdquizzes', 'dbdquizinfo', 'dbdqg'],
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('🎯 Dead by Daylight Quizzes - Information')
      .setDescription(
        'Welcome to the Dead by Daylight Quizzes! Test your knowledge with interactive quiz challenges.'
      )
      .addFields(
        {
          name: '🖼️ Perk Quiz (`!pq` or `!perkquiz`)',

          value:
            'Two types of questions:\n• **Perk Image**: Identify the perk from its icon\n• **Survivor Question**: Name who has this perk\nYou have 3 minutes to answer correctly!',
        },
        {
          name: '📝 Description Quiz (`!dq` or `!descriptionquiz`)',

          value:
            'Read the perk description and guess the perk name. Perk names are removed from descriptions to avoid spoilers!\nYou have 3 minutes to answer correctly!',
        },
        {
          name: '⏱️ Quiz Rules',
          value:
            '• Only one active quiz per user at a time\n• 3-minute time limit per quiz\n• Type `!ff` to give up and see the answer\n• Earn XP for correct answers!',
        },
        {
          name: '🚫 Forfeit Option',
          value:
            'Stuck on a question? Type `!ff` to end the quiz early and reveal the correct answer.',
        },
        {
          name: '📜 Additional Commands',
          value:
            '• `!survivors` - List all survivors\n• `!killers`- List all killers (Working on it)\n• `!survivorInformation <name>` or !survivor or !surv - Get information about a specific survivor\n• `!perkInformation <perk name>` or !perk - Get information about a specific perk',
        }
      )
      .setColor(0x00ae86)
      .setFooter({
        text: 'Test your Dead by Daylight knowledge and have fun!',
      });
    message.channel.send({ embeds: [embed] });
  },
};
