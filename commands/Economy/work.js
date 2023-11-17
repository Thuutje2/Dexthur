const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'work',
    description: 'Work for money.',
    category: 'Casino',
    cooldown: 60 * 60, // 1 hour

    async execute(message, args) {
        const currentTimestampInSeconds = Math.floor(Date.now() / 1000); // Convert to seconds

        const lastWorkTimestampResult = await query('SELECT EXTRACT(EPOCH FROM last_work_claim AT TIME ZONE \'UTC\') AS last_work_claim FROM users WHERE user_id = $1', [message.author.id]);
        const lastWorkTimestamp = (lastWorkTimestampResult.rows[0] && lastWorkTimestampResult.rows[0].last_work_claim) || 0;

        const timeSinceLastClaim = currentTimestampInSeconds - lastWorkTimestamp;

        let timeUntilNextClaim = this.cooldown - (timeSinceLastClaim % this.cooldown);

        const mintues = Math.floor(timeUntilNextClaim / 60);

        if (timeSinceLastClaim < this.cooldown) {
            return message.reply(`You can work again in ${mintues} minutes.`);
        }

        const currentBalanceResult = await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
        const currentBalance = (currentBalanceResult.rows[0] && currentBalanceResult.rows[0].balance) || 0;

        // Generate a random number between 1 and 500
        const workReward = Math.floor(Math.random() * 500) + 1;
        const newBalance = currentBalance + workReward;

        await query('UPDATE users SET balance = $1, last_work_claim = CURRENT_TIMESTAMP AT TIME ZONE \'UTC\' WHERE user_id = $2', [newBalance, message.author.id]);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Work Reward')
            .setDescription(`You've worked for ${workReward} coins. Your new balance is ${newBalance} coins.`);

        message.reply({ embeds: [embed] });
    },
};