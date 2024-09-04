
module.exports = {
    name: 'dexter',
    description: 'picture of Dexter',
    aliases: ['dex'],
    execute(message, args) {
        message.channel.send('https://imgur.com/a/7IxNrII');
    }
}