const { EmbedBuilder } = require('@discordjs/builders');
const { query } = require('../../database');

module.exports = {
    name: 'infochar',
    description: 'Character information',
    aliases: ['ic'],
    async execute(message, args) {
        try {
            const character = args.join(' ').toLowerCase();

            const result = await query('SELECT * FROM disney_characters WHERE LOWER(name) = $1', [character]);

            if (!result || result.rows.length === 0) {
                return message.channel.send(`No information found for character: ${character}`);
            }

            const characterInformation = result.rows[0];

            if (!characterInformation.name || !characterInformation.image) {
                return message.channel.send(`Incomplete information found for character: ${character}`);
            }

            const embed = new EmbedBuilder()
                .setTitle(characterInformation.name)
                .setImage(characterInformation.image)
                .setColor(0x78f06a);


            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Er is een fout opgetreden bij het ophalen van informatie over de character: ', error);
            message.channel.send('An error occurred while getting information of the character.');
        }
    }
}





