const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'giveMoney',
    description: 'Give money to another user.',
    aliases: ['give'],
    category: 'Casino',
    async execute(message, args) {
        const amount = parseInt(args[1]);
        const user = message.mentions.users.first();

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Please provide a valid amount greater than 0.');
        }

        if (!user) {
            return message.reply('Please mention a user to give money to.');
        }

        if (user.id === message.author.id) {
            return message.reply('You can\'t give money to yourself.');
        }

        // user staat niet in de database
        const userExists = await query('SELECT 1 FROM users WHERE user_id = $1', [user.id]);
        if (!userExists.rows.length) {
            return message.reply('The user you are trying to give money to does not have an account.');
        }

        const currentBalanceResult = await query('SELECT balance FROM users WHERE user_id = $1', [message.author.id]);
        const currentBalance = (currentBalanceResult.rows[0] && currentBalanceResult.rows[0].balance) || 0;

        if (currentBalance < amount) {
            return message.reply('You don\'t have enough coins to give that amount.');
        }

        const recipientBalanceResult = await query('SELECT balance FROM users WHERE user_id = $1', [user.id]);
        const recipientBalance = (recipientBalanceResult.rows[0] && recipientBalanceResult.rows[0].balance) || 0;

        await query('UPDATE users SET balance = balance - $1 WHERE user_id = $2', [amount, message.author.id]);
        await query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [amount, user.id]);

        message.reply(`You have given ${amount} coins to ${user.username}.`);
    }
}