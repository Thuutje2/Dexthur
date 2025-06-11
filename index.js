require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
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

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

// Load commands
const commandHandler = require('./handlers/command_handler');
commandHandler(client);

// Laad interactie-handlers
const interactionHandler = require('./handlers/interaction_handler');
interactionHandler(client);

// Laad slash commands
const deployCommands = require('./handlers/deploy-commands');
deployCommands(client);

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
      console.error(
        `Error executing command "${commandName}": ${error.message}` +
          '\n' +
          error.stack
      );
      message.reply(
        'Er is een fout opgetreden bij het uitvoeren van het commando.'
      );
    }
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command || !command.executeSlash) {
    console.error(`No slash command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.executeSlash(interaction);
  } catch (error) {
    console.error(`Error executing slash command "${interaction.commandName}":`, error);
    const errorMessage = 'There was an error executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: errorMessage, 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: errorMessage, 
        ephemeral: true 
      });
    }
  }
});

client.login(token);
