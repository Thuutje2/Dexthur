const { EmbedBuilder } = require("discord.js");
const SteamAPI = require('steamapi');
const fs = require('fs');

const rawConfig = fs.readFileSync('config.json');
const config = JSON.parse(rawConfig);

const steam = new SteamAPI(config.steamapikey);

module.exports = {
  name: 'steamprofile',
  permissions: [],
  description: 'Get information about a Steam user profile and their top games',
  aliases: ['steam', 'sp'],
  async execute(message, args, client) {
    try {
      // Validate input
      if (!args[0]) {
        return message.channel.send('You need to provide a Steam ID. Example: `!steamprofile 76561198077579912`');
      }

      const steamID = args[0];

      // Log the steamID for debugging
      console.log(`Received Steam ID: ${steamID}`);

      // Validate Steam ID format (basic validation)
      if (!/^\d+$/.test(steamID)) {
        return message.channel.send('the Steam ID provided is invalid or there was an error fetching data from Steam');
      }

      // Fetch user summary and owned games
      const user = await steam.getUserSummary(steamID);
      const games = await steam.getUserOwnedGames(steamID);

      // Log the fetched user data for debugging
      console.log(`Fetched user data: ${JSON.stringify(user)}`);

      if (!user || !user.nickname || !user.avatar || !user.steamID || user.personaState === undefined) {
        console.error('Ongeldige gebruikersgegevens ontvangen van de Steam API:', user);
        throw new Error('Invalid user data received from the Steam API');
      }

      const profileEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`${user.nickname}'s Steam Profile`)
          .setThumbnail(user.avatar.medium)
          .addFields(
              { name: 'Steam ID', value: user.steamID },
              { name: 'Real name', value: user.realName || 'N/A' },
              { name: 'Status', value: user.personaState === 1 ? 'Online' : 'Offline' },
              { name: 'Total Games', value: String(games.length) }
          );

      if (games.length > 0) {
        const topGames = games.sort((a, b) => b.playTime - a.playTime).slice(0, 5);
        for (const game of topGames) {
          const gameInfo = await steam.getGameDetails(game.appID); // Haal game details op
          const gameName = gameInfo.name;
          const gameArtwork = gameInfo.header_image; // Het spelafbeelding
          const gamePlayTime = Math.floor(game.playTime / 60); // Speeltijd in uren

          profileEmbed.addFields({ name: gameName, value: `${gamePlayTime} uur`, inline: true });
        }
      } else {
        profileEmbed.addFields({ name: 'Top Games', value: 'No games' });
      }

      const content = 'Information about the Steam profile';
      message.channel.send({ content, embeds: [profileEmbed] });
    } catch (error) {
      console.error(error);
      if (error.message.includes('Invalid/no id provided')) {
        message.channel.send('Invalid Steam ID provided or there was an error fetching data from Steam');
      } else {
        message.channel.send('An error occurred while fetching the Steam profile. Please try again later.');
      }
    }
  },
};













