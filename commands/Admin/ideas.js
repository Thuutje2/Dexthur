const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
  name: 'ideas',
  description: 'View the ideas list for admins.',
  category: 'Admin',
  async execute(message, args) {
    try {
      // Controleer of de gebruiker een admin is
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('You do not have the necessary permissions to view the ideas list.');
      }

      // Voor het ophalen van ideeën van de database voor de huidige server
      const serverId = message.guild.id;
      const result = await query('SELECT * FROM ideas WHERE server_id = $1', [serverId]);
      const ideasList = result.rows;

      // Embed wordt gemaakt op basis van de opgehaalde ideeën
      if (ideasList.length === 0) {
        return message.reply('The ideas list for this server is currently empty.');
      }

      const ideasMessage = ideasList.map((idea, index) => `**#${index + 1}:** ${idea.idea_text}`).join('\n');

      const url = message.client.user.displayAvatarURL({ extension: "png", size: 1024 });
      const ideasListEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Ideas List (Admins Only)')
        .setDescription('Current ideas list for this server:')
        .setAuthor({
          name: message.author.username,
          icon_url: url,
        })
        .setTimestamp()
        .setFooter({
          text: 'Ideas List',
          icon_url: message.client.user.avatarURL(),
        })
        .addFields(
          { name: 'Ideas', value: ideasMessage }
        );

      message.channel.send({ embeds: [ideasListEmbed], components: [] });
    } catch (error) {
      console.error('Error fetching ideas list:', error);
      message.reply('An error occurred while fetching the ideas list.');
    }
  },
};

