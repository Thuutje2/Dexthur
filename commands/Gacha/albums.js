const db = require('../../database');

module.exports = {
    name: 'albums',
    description: 'View your albums.',
    usage: '!albums',
    category: 'Gacha',
    async execute(message, args) {
        try {
        // Haal alle albums op die de gebruiker heeft
        const albumsResult = await db.query('SELECT a.album_name FROM albums a JOIN user_albums ua ON a.album_id = ua.album_id WHERE ua.user_id = $1', [message.author.id]);
        const albums = albumsResult.rows;
    
        if (albums.length === 0) {
            return message.reply('You have no albums.');
        }
    
        // Bouw een bericht op met de albuminformatie
        const albumsMessage = albums.map(album => album.album_name).join('\n');
    
        message.reply(`Your albums:\n${albumsMessage}`);
        } catch (error) {
        console.error('Error fetching albums:', error);
        message.reply('An error occurred while fetching your albums.');
        }
    },


};
