const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'server',
    permissions: ["CONNECT"],
    description: "This is a server command!",
    execute(message, args, client){
        const { guild, channel } = message;
        const { name, region, memberCount, owner, botCount } = guild;
        const icon = guild.iconURL();

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Server info for ${name}` }) 
            .setThumbnail(icon)
            .setColor('#6dbac9')
            .addFields(
                {
                    // server naam
                   name: 'Server name: ',
                   value: `${name}`,
                },
                {
                    // server regio
                    name: 'region: ',
                    value: `${region}`,
    
                },
                {
                    // totaal aantal leden in de servers bots + members
                    name: 'All Members: ',
                    value: `${memberCount}`,
    
                },
                {
                    // totaal aantal members
                    name: 'Total Members : ',
                    value: `${guild.members.cache.filter(member => !member.user.bot).size}`,
    
                },
                // {
                //     // totaal aantal bots
                //     name: 'Total Bots : ',
                //     value: `${guild.members.cache.filter(bot => !bot.user.member).size}`,
    
                // },
                {
                    // wanneer de discord is gemaakt
                    name: 'Server created: ',
                    value: new Date(guild.createdTimestamp).toLocaleDateString(),
                }
            )
            .setTimestamp();

        // Set content for the message
        const content = 'Server information:';
        
        // Send both content and embed
        channel.send({ content, embeds: [embed] });
    }
}
