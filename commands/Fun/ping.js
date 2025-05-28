module.exports = {
  name: 'ping',
  description: 'Ping!',
  category: 'Fun',
  execute(message, args) {
    message.channel.send('Pong!');
  },
};
