const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'account',
    description: 'View your account on League of Legends.',
    aliases: ['acc'],
    category: 'League of Legends',

    execute(message, args) {
        const username = args[0];
        const region = args[1];

        if (!region) {
            message.reply('Please provide a region.');
            return;
        }

        import('../../index.js').then(({ client }) => {
            const api_key = process.env.RIOT_API_KEY;
            const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${api_key}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const summonerId = data.id;
                    const accountId = data.accountId;
                    const puuid = data.puuid;
                    const summonerLevel = data.summonerLevel;
                    const profileIconId = data.profileIconId;
                    const revisionDate = data.revisionDate;
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle('League of Legends Account')
                        .addFields(
                            { name: 'Username', value: username },
                            { name: 'Region', value: region },
                            { name: 'Summoner ID', value: summonerId },
                            { name: 'Account ID', value: accountId },
                            { name: 'PUUID', value: puuid },
                            { name: 'Summoner Level', value: summonerLevel },
                            { name: 'Profile Icon ID', value: profileIconId },
                            { name: 'Revision Date', value: revisionDate }
                        );
                    message.reply({ embeds: [embed] });
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }).catch(error => {
            console.error('Error importing client:', error);
        });
    }
}

