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

// Help command
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  if (customId === 'help_casino') {
    const casinoEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Casino Commands')
      .setDescription('List of casino commands.')
      .addFields(
        { name: '`Slots`', value: 'Play the slots. `!Slots <bet>`' },
        { name: '`Blackjack`', value: 'Play a game of blackjack. `!Blackjack <bet>`' },
        { name: '`Roulette`', value: 'Play a game of roulette. `!Roulette <bet>`' },
        { name: '`Coinflip`', value: 'Flip a coin and bet on the outcome. `!Coinflip <bet> <heads/tails>`' },
      );

    interaction.update({ embeds: [casinoEmbed], components: [] });
  } else if (customId === 'help_economy') {
    const economyEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Economy Commands')
      .setDescription('List of economy commands.')
      .addFields(
        { name: '`Adduser`', value: 'Add a user to the database. `!Adduser`' },
        { name: '`Balance`', value: 'Check your balance. `!Balance`' },
        { name: '`Buy`', value: 'Buy an item or role from the store. `!Buy <item_name>`' },
        { name: '`Store`', value: 'View items available in the store. `!Store`' },
        { name: '`Inventory`', value: 'View your inventory. `!Inventory`' },
        { name: '`Daily`', value: 'Claim your daily reward. `!Daily`' },
        { name: '`Monthly`', value: 'Claim your monthly reward. `!Monthly`' },
        { name: '`Yearly`', value: 'Claim your yearly reward. `!Yearly`' },
      );

    interaction.update({ embeds: [economyEmbed], components: [] });
  } else if (customId === 'help_fun') {
    const funEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Fun Commands')
      .setDescription('List of fun commands.')
      .addFields(
        { name: '`Ping`', value: 'Ping. `!Ping`' },
        { name: '`Random`', value: 'Generate a random number between 1 and 100. `!Random`'},
        { name: '`Userinfo`', value: 'Get information about a user. `!Userinfo <user>`' },
        { name: '`Server`', value: 'Get information about the server. `!Server`' },
      );

    interaction.update({ embeds: [funEmbed], components: [] });
  } else if (customId === 'help_admin') {
    const adminEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Admin Commands')
      .setDescription('List of admin commands.')
      .addFields(
        { name: '`Clear`', value: 'Clear messages. `!Clear <amount>`' },
        { name: '`Additem`', value: 'Add a new item or role to the store. `!Additem <item_name> <item_price> <item_type>`' },
        { name: '`Removeitem`', value: 'Remove an item or role from the store. `!Removeitem <item_name>`' },
        { name: '`Ideas`', value: 'View the ideas list for admins. `!Ideas`' },
        { name: '`Addidea`', value: 'Add an idea to the ideas list. `!Addidea <idea>`' },
        { name: '`Removeidea`', value: 'Remove an idea from the ideas list. `!Removeidea <idea_number>`' },
      );

    interaction.update({ embeds: [adminEmbed], components: [] });
  }
});


client.login(token);












