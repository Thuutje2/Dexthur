module.exports = {
    name: 'balance',
    description: 'Check your balance.',
    category: 'Casino',
    execute(message, args, userData) {
      const userBalance = userData.balance || 0;
      message.reply(`Your current balance is ${userBalance} coins.`);
    },
  };
  