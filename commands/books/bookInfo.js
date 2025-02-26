const { EmbedBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    name: 'bookInfo',
    description: 'Get information about a book from Google Books.',
    aliases: ['bi'],
    args: true,
    usage: '<book_title>',
    async execute(message, args) {
        const bookTitle = args.join(' ');
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}&key=${apiKey}`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data.totalItems > 0) {
                const book = data.items[0].volumeInfo;
                const embed = new EmbedBuilder()
                    .setTitle(book.title)
                    .setDescription(book.description || 'No description available.')
                    .setColor(0x00AE86)
                    .addFields(
                        { name: 'Authors', value: book.authors ? book.authors.join(', ') : 'Unknown', inline: true },
                        { name: 'Published Date', value: book.publishedDate || 'Unknown', inline: true },
                        { name: 'Publisher', value: book.publisher || 'Unknown', inline: true }
                    )
                    .setThumbnail(book.imageLinks ? book.imageLinks.thumbnail : null);

                await message.reply({ embeds: [embed] });
            } else {
                await message.reply(`No results found for "${bookTitle}"`);
            }
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while fetching the book data.');
        }
    }
};