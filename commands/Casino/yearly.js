// yearly.js
module.exports = {
    name: 'yearly',
    description: 'Claim your yearly reward.',
    category: 'Casino',
    execute(message, args, userData) {
      // Your logic for the yearly command
      const yearlyReward = 2000; // Adjust the yearly reward amount
  
      // Check if the user has already claimed the yearly reward this year
      const lastYearlyClaim = userData.lastYearlyClaim || 0;
      const currentTime = new Date().getTime();
      const oneYearInMillis = 365 * 24 * 60 * 60 * 1000;
  
      if (currentTime - lastYearlyClaim < oneYearInMillis) {
        return message.reply('You have already claimed your yearly reward this year.');
      }
  
      // Grant the yearly reward
      userData.balance += yearlyReward;
      userData.lastYearlyClaim = currentTime;
  
      message.reply(`Congratulations! You claimed your yearly reward of ${yearlyReward} coins. Your new balance is ${userData.balance} coins.`);
    },
  };
  