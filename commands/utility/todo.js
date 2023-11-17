const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { query } = require('../../database');

module.exports = {
  name: 'todo',
  description: 'Manage your todo list.',
  async execute(message, args) {
    // Subcommand wordt hier opgehaald
    const subCommand = args[0]?.toLowerCase();

    // Voor het toevoegen van een todo
    if (subCommand === 'add') {
      const todoText = args.slice(1).join(' ');
      if (!todoText) {
        return message.reply('Please provide a description for the todo.');
      }

      // User ID en todo-informatie worden toegevoegd aan de database
      const userId = message.author.id;
      await query('INSERT INTO todo_list (user_id, todo_text, checked) VALUES ($1, $2, $3)', [userId, todoText, false]);

      message.reply(`Todo added: "${todoText}"`);
    } else if (subCommand === 'list') {
      // Voor het ophalen van de todo's van de database
      const userId = message.author.id;
      const result = await query('SELECT * FROM todo_list WHERE user_id = $1', [userId]);
      const userTodos = result.rows;

      // Embed wordt gemaakt op basis van de opgehaalde todo's
      if (userTodos.length === 0) {
        return message.reply('Your todo list is empty.');
      }


      const url = message.client.user.displayAvatarURL({ extension: "png", size: 1024 });
      const todoListEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Todo List')
        .setDescription('Your current todo list:')
        .setAuthor({
          name: message.author.username,
          icon_url: url,
        })
        .setTimestamp()
        .setFooter({
          text: 'Todo List',
          icon_url: message.client.user.avatarURL(),
        })
        .addFields(userTodos.map((todo, index) => ({ name: `#${index + 1}`, value: `${todo.checked ? '✅' : '[ ]'} ${todo.todo_text}` })));
        

      message.channel.send({ embeds: [todoListEmbed], components: [] });
    } else if (subCommand === 'check') {
      // Voor het bijwerken van de status van een todo in de database
      const todoIndex = parseInt(args[1]) - 1;
      if (isNaN(todoIndex)) {
        return message.reply('Please provide a valid todo number to check off.');
      }

      const userId = message.author.id;
      const result = await query('SELECT * FROM todo_list WHERE user_id = $1', [userId]);
      const userTodos = result.rows;

      if (todoIndex < 0 || todoIndex >= userTodos.length) {
        return message.reply('Invalid todo number. Check your todo list using `!todo list`.');
      }

      await query('UPDATE todo_list SET checked = $1 WHERE user_id = $2 AND todo_id = $3', [true, userId, userTodos[todoIndex].todo_id]);

      message.reply(`Todo #${todoIndex + 1} checked off.`);
    } else if (subCommand === 'remove') {
      // Voor het verwijderen van een todo uit de database
      const todoIndex = parseInt(args[1]) - 1;
      if (isNaN(todoIndex)) {
        return message.reply('Please provide a valid todo number to remove.');
      }

      const userId = message.author.id;
      const result = await query('SELECT * FROM todo_list WHERE user_id = $1', [userId]);
      const userTodos = result.rows;

      if (todoIndex < 0 || todoIndex >= userTodos.length) {
        return message.reply('Invalid todo number. Check your todo list using `!todo list`.');
      }

      await query('DELETE FROM todo_list WHERE user_id = $1 AND todo_id = $2', [userId, userTodos[todoIndex].todo_id]);

      message.reply(`Todo #${todoIndex + 1} removed: "${userTodos[todoIndex].todo_text}"`);
    } else {
      // Als geen geldige subcommand is opgegeven, wordt help-bericht weergegeven
      const helpEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Todo Command Help')
        .setDescription('Manage your todo list.')
        .addFields(
          { name: 'Add Todo', value: '`!todo add <description>`' },
          { name: 'List Todos', value: '`!todo list`' },
          { name: 'Check Off Todo', value: '`!todo check <number>`' },
          { name: 'Remove Todo', value: '`!todo remove <number>`' }
        );

      message.reply({ embeds: [helpEmbed] });
    }
  },
};

