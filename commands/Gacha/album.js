const db = require('../../database');

module.exports = {
  name: 'album',
  description: 'View your album.',
  usage: '!album <album_name>',
  category: 'Gacha',
  async execute(message, args) {
    const albumName = args[0];

    try {
      // Zet de albumnaam om naar kleine letters voor case-insensitieve vergelijking
      const normalizedAlbumName = albumName.toLowerCase();
      

      // Zoek het album op basis van de genormaliseerde naam
      const albumResult = await db.query('SELECT album_id FROM albums WHERE LOWER(album_name) = $1', [normalizedAlbumName]);
      const album = albumResult.rows[0];

      if (!album) {
        return message.reply('Album not found.');
      }

      // Voeg het album toe aan de user_albums-tabel
      await db.query('INSERT INTO user_albums (user_id, album_id) VALUES ($1, $2) ON CONFLICT (user_id, album_id) DO NOTHING', [message.author.id, album.album_id]);

      // Haal de stickers op voor het huidige album van de gebruiker
      const stickersResult = await db.query('SELECT s.sticker_name, s.image_url FROM stickers s JOIN user_stickers us ON s.sticker_id = us.sticker_id WHERE us.user_id = $1 AND s.album_id = $2', [message.author.id, album.album_id]);
      const stickers = stickersResult.rows;

      if (stickers.length === 0) {
        return message.reply('Your album is empty.');
      }

      // Bouw een bericht op met de stickerinformatie
      const albumMessage = stickers.map(sticker => `[${sticker.sticker_name}](${sticker.image_url})`).join('\n');

      message.reply(`Your "${albumName}" album:\n${albumMessage}`);
    } catch (error) {
      console.error('Error fetching album:', error);
      message.reply('An error occurred while fetching your album.');
    }
  },
};

