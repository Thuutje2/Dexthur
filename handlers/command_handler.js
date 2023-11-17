const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = (client) => {
  client.commands = new Collection();

  const categories = fs.readdirSync('./commands/');

  for (const category of categories) {
    const commandFiles = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${category}/${file}`);
      client.commands.set(command.name, command);
      
      // Voeg hier het volgende toe om aliassen correct in te stellen
      if (command.aliases) {
        for (const alias of command.aliases) {
          client.commands.set(alias, command);
        }
      }

      console.log(`Command ${command.name} loaded.`);
    }
  }
  
  return client;
};

  
