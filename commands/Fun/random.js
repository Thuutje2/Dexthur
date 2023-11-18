module.exports = {
    name: 'random',
    description: 'Generate a random number between 1 and 100.',
    usage: '!random',
    category: 'Fun',
    execute(message, args) {
      const randomNum = Math.floor(Math.random() * 100) + 1;
      message.reply(`Your random number is: ${randomNum}`);
    },
  };
  