module.exports = {
    name: 'addpackstore',
    description: 'Add a new pack to the store with stickers.',
    usage: '!addpackstore <pack_name> <pack_price> <value1> <value2> <value3> ...',
    category: 'Admin',
    async execute(message, args) {
      // Voeg controle toe voor beheerderrechten
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('You do not have permission to use this command.');
      }
  
      const packName = args[0];
      const packPrice = parseInt(args[1]);
  
      try {
        // Voeg het pack toe aan de store
        const packResult = await db.query('INSERT INTO store_packs (pack_name, pack_price) VALUES ($1, $2) RETURNING pack_id', [packName, packPrice]);
        const packId = packResult.rows[0].pack_id;
  
        // Voeg stickers toe aan het pack
        for (let i = 2; i < args.length; i++) {
          const stickerValue = args[i];
          const randomSticker = await db.getRandomStickerByValue(stickerValue);
  
          if (randomSticker) {
            await db.query('INSERT INTO pack_stickers (pack_id, sticker_id, value) VALUES ($1, $2, $3)', [packId, randomSticker.sticker_id, stickerValue]);
          } else {
            console.warn(`No sticker found with value: ${stickerValue}`);
          }
        }
  
        message.reply(`Pack ${packName} with price ${packPrice} coins and stickers has been added to the store.`);
      } catch (error) {
        console.error('Error adding pack to the store:', error);
        message.reply('An error occurred while adding the pack to the store.');
      }
    },
  };
  