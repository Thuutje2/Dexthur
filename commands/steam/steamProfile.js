const { EmbedBuilder } = require("discord.js");
const SteamAPI = require('steamapi');
const fs = require('fs');

const rawConfig = fs.readFileSync('config.json');
const config = JSON.parse(rawConfig);

const steam = new SteamAPI(config.steamapikey);

module.exports = {
  name: 'steamprofile',
  permissions: [],
  description: 'Ontvang informatie over een Steam-gebruikersprofiel.',
  aliases: ['steam', 'sp'],
  async execute(message, args, client) {
    try {
      const steamID = args[0];
      const user = await steam.getUserSummary(steamID);
      const games = await steam.getUserOwnedGames(steamID);

      if (!user || !user.nickname || !user.avatar || !user.steamID || !user.personaState) {
        console.error('Ongeldige gebruikersgegevens ontvangen van de Steam API:', user);
        throw new Error('Ongeldige gebruikersgegevens ontvangen van de Steam API');
      }

      const profileEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`${user.nickname}'s Steam Profile`)
          .setThumbnail(user.avatar.medium)
          .addFields(
              { name: 'Steam ID', value: user.steamID },
              { name: 'Echte naam', value: user.realName || 'N/A' },
              { name: 'Status', value: user.personaState === 1 ? 'Online' : 'Offline' },
              { name: 'Aantal spellen', value: String(games.length) }
          );

      if (games.length > 0) {
        const topGames = games.sort((a, b) => b.playTime - a.playTime).slice(0, 5);
        for (const game of topGames) {
          const gameInfo = await steam.getGameDetails(game.appID); // Haal game details op
          const gameName = gameInfo.name;
          const gameArtwork = gameInfo.header_image; // Het spelafbeelding
            const gamePlayTime = Math.floor(game.playTime / 60); // Speeltijd in uren


          profileEmbed.addFields({ name: gameName , value: gamePlayTime.toString() + " uur", inline: true, image: gameArtwork });
        }
      } else {
        profileEmbed.addFields({ name: 'Top Games', value: 'Geen spellen beschikbaar' });
      }

      const content = 'Informatie over het Steam-profiel:';
      message.channel.send({ content, embeds: [profileEmbed] });
    } catch (error) {
      console.error(error);
      message.channel.send('Er is een fout opgetreden bij het ophalen van gegevens van Steam.');
    }
  },
};











