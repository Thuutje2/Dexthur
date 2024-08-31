const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'disneyguessgame',
    description: 'Provides information about the Guess the Disney Character game.',
    aliases: ['disneygame', 'disneyinfo', 'dgg'],
    execute(message) {
        const embed = new EmbedBuilder()
            .setTitle('🎯 Guess the Disney Character - Information')
            .setDescription('Welcome to the "Guess the Disney Character" game! Here’s how to play and what you need to know:')
            .addFields(
                { name: '📝 How to Play', value: 'Start guessing by using the command `!guess <character name>`. Replace `<character name>` with the name of the Disney character you think is correct.' },
                { name: '\n\n🔍 Hints', value: 'You receive hints for incorrect attempts. The number of hints you receive depends on the number of failed attempts. After 6 incorrect attempts, you will no longer receive hints.\n\n'},
                { name: '⏲️ Waiting Time', value: 'After each attempt, whether correct or incorrect, you must wait until midnight (00:00) before you can guess again. This means you can only participate once per day, regardless of whether your guess was correct or incorrect.\n'},
                { name: '\n\n🏆 Points and Streaks', value: '• **Points**: You earn points based on how quickly you guess the correct Disney character. The fewer incorrect attempts, the more points you earn.\n  ⚪ Guess 1: 50 points\n  ⚪ Guess 2: 40 points\n  ⚪ Guess 3: 30 points\n  ⚪ Guess 4: 20 points\n  ⚪ Guess 5: 10 points\n  ⚪ Guess 6: 5 points\n  ⚪ Incorrect answer: 0 points\n\n• **Streaks**: With a correct guess, you start a new streak. Your streak counts the number of consecutive correct guesses. A new day or an incorrect guess resets your streak.' }
            )
            .setColor(0x00AE86)
            .setFooter({ text: 'Have fun guessing Disney characters!' });

        message.channel.send({ embeds: [embed] });
    }
};
