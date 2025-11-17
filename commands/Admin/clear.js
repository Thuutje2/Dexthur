const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  permissions: ['Administrator', 'ManageMessages'],
  description: 'Clear a specified number of messages.',
  execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.channel.send('Please provide a number between 1 and 100.');
    }

    // Check if the member has the necessary permissions using proper permission flags
    try {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.channel.send(
          "You don't have permission to manage messages."
        );
      }

      message.channel
        .bulkDelete(amount, true)
        .then((messages) => {
          message.channel
            .send(`Successfully cleared ${messages.size} messages.`)
            .then((msg) => {
              setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        })
        .catch((error) => {
          console.log('Clear command error:', error.message);
          message.channel
            .send(
              'Could not delete messages. They might be too old (14+ days).'
            )
            .then((msg) => {
              setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        });
    } catch (error) {
      console.log('Permission check error:', error.message);
      message.channel
        .send('An error occurred while checking permissions.')
        .then((msg) => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    }
  },
};
