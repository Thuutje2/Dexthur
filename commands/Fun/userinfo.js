const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'userinfo',
  description: 'Get information about a user.',
  execute(message, args) {
    const {guild, channel} = message
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user || message.author;
    const member = guild.members.cache.get(user.id)

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('User Information')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Username', value: user.username },
        { name: 'Discriminator', value: user.discriminator },
        { name: 'ID', value: user.id },
        { name: 'Joined Discord', value: new Date(user.createdTimestamp).toLocaleDateString()},
        { name: 'Joined Server', value: new Date(member.joinedTimestamp).toLocaleDateString()}
      );

    // Voeg het veld voor status toe als de gebruiker aanwezig is
    if (user.presence) {
      embed.addField('Status', user.presence.status);
    }

    // Voeg de tijdstempel toe aan het einde
    embed.setTimestamp();

    // Stuur de embed naar het kanaal waar het commando is gebruikt
    message.channel.send({ embeds: [embed] });
  },
};




