const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { prefix, token } = require('./config.json');
const { EmbedBuilder } = require('@discordjs/builders');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

// Load commands
const commandHandler = require('./handlers/command_handler');
commandHandler(client);

// Laad interactie-handlers
const interactionHandler = require('./handlers/interaction_handler');
interactionHandler(client);

// 
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (command) {
    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`Error executing command "${commandName}": ${error.message}` + '\n' + error.stack);
      message.reply('Er is een fout opgetreden bij het uitvoeren van het commando.');
    }
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.login(token);












