const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { prefix, token } = require('./config.json');
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

// Command Map (if needed)
// client.commands = new Map();

client.on('messageCreate', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (command) {
    command.execute(message, args, client);
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);










