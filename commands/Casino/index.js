const balanceCommand = require('./balance');
const slotsCommand = require('./slots');

module.exports = {
  name: 'casino',
  description: 'Casino commands.',
  execute(message, args, userData) {
    const subCommand = args.shift();

    switch (subCommand) {
      case 'balance':
        balanceCommand.execute(message, args, userData);
        break;
      case 'slots':
        slotsCommand.execute(message, args, userData);
        break;
      case 'daily': // Handle the daily command
        dailyCommand.execute(message, args, userData);
        break;
      default:
        message.reply('Invalid casino command. Use `!casino balance` or `!casino slots`.');
    }
  },
};
