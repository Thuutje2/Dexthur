const { query } = require('../../database');

module.exports = {
    name: 'disneyFavoriteCharacter',
    description: 'Set your favorite Disney character.',
    args: true,
    usage: '<character_name>',
    aliases: ['dfc', 'favoriteCharacter'],
    async execute(message, args) {
        if (args.length < 1) {
            return message.reply(`Usage: !character <character_name>. Please provide the name of your favorite Disney character.`);
        }

        // Combine all arguments into a single string for character name
        const characterName = args.join(' ');

        try {
            // Update only the favorite character in the database
            await query(`
                INSERT INTO user_favorites (user_id, favorite_character_name)
                VALUES ($1, $2)
                ON CONFLICT (user_id) DO UPDATE
                SET favorite_character_name = EXCLUDED.favorite_character_name
            `, [message.author.id, characterName]);

            message.reply('Your favorite character has been updated!');
        } catch (error) {
            console.error('Error occurred in character command', error);
            message.reply('An error occurred while updating your favorite character. Please try again later.');
        }
    }
}
