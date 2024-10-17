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
                { name: '⏲️ Waiting Time', value: 'After each correct attempt, you must wait 15 minutes before you can guess again.\n'},
                { name: '\n\n 🏆 Points and Streaks', value: '• **Points**: You earn points based on how quickly you guess the correct Disney character. The fewer incorrect attempts, the more points you earn.\n  ⚪ Guess 1: 50 points\n  ⚪ Guess 2: 40 points\n  ⚪ Guess 3: 30 points\n  ⚪ Guess 4: 20 points\n  ⚪ Guess 5: 10 points\n  ⚪ Guess 6: 5 points\n  ⚪ Incorrect answer: 0 points\n\n• **Correct Guesses Streak**: When you guess a character correctly, your streak increases by 1, but if you make a wrong guess, the streak resets to 0.' },
                { name: '\n\n 📊 Leaderboard', value: 'Check the leaderboard with the command `!glb` to see who has the most points and longest correct count.' },
                { name: '\n\n 📋 Profile', value: 'View your profile with the command `!gp` to see your total points, correct guesses count, favorite character, and favorite serie or film.' },
                { name: '\n\n 📜 Characters List', value: 'View the list of available Disney characters with the command `!dc`.' },
                { name: '\n\n 🎥 Series or Film Information', value: 'Get information about the Disney characters in a specific series or film with the command `!si <series or film name>`.' },
                { name: '\n\n ❓ Character Information', value: 'Get information about a specific Disney character with the command `!ci <character name>`.' },
                { name: '\n\n 📢 Update', value: 'When there are new characters available you can check the update with the command `!update`.' },
            )
            .setColor(0x00AE86)
            .setFooter({ text: 'Have fun guessing Disney characters!' });

        message.channel.send({ embeds: [embed] });
    }
};
