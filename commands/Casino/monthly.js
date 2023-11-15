// monthly.js
module.exports = {
    name: 'monthly',
    description: 'Claim your monthly reward.',
    category: 'Casino',
    execute(message, args, userData) {
      // Your logic for the monthly command
      const monthlyReward = 500; // Adjust the monthly reward amount
  
      // Check if the user has already claimed the monthly reward this month
      const lastMonthlyClaim = userData.lastMonthlyClaim || 0;
      const currentTime = new Date().getTime();
      const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;
  
      if (currentTime - lastMonthlyClaim < oneMonthInMillis) {
        return message.reply('You have already claimed your monthly reward this month.');
      }
  
      // Grant the monthly reward
      userData.balance += monthlyReward;
      userData.lastMonthlyClaim = currentTime;
  
      message.reply(`Congratulations! You claimed your monthly reward of ${monthlyReward} coins. Your new balance is ${userData.balance} coins.`);
    },
  };
  