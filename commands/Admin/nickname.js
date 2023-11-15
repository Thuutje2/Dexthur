const discord = require('discord.js')
module.exports = {
    name: 'nickname',
    permissions: ["ADMINISTRATOR"],
    description: "this is a nickname command!",
    execute(message, args, client){
        const target = message.mentions.users.first() 
        
        if(target){
            const member = message.guild.members.cache.get(target.id) 
            args.shift()
            const nickname = args.join(' ')
            member.setNickname(nickname)
            message.channel.send('Je hebt de naam veranderd')
        } else {
            message.channel.send(`You need someone`);
        }
    }
}