module.exports = {
  name: 'idea',
  description: 'Submit your idea!',
  category: 'Ideas',
  execute(message, args) {
    // Combine args into a single idea string
    const idea = args.join(' ');

    // Check if an idea has been provided
    if (!idea) {
      return message.channel.send(
        'You must provide an idea! Use: `!idea <your idea>`'
      );
    }

    // Send the idea to a specific channel (e.g., #ideas)
    const ideasChannel = message.guild.channels.cache.find(
      (channel) => channel.name === 'ideas'
    );

    if (!ideasChannel) {
      return message.channel.send(
        'The ideas channel was not found. Please make sure it exists.'
      );
    }

    // Send the idea to the ideas channel
    ideasChannel.send(
      `**New idea from:** ${message.author.username}\n\`\`\`${idea}\`\`\``
    );
    message.channel.send(
      'Your idea has been submitted! Thank you for your contribution.'
    );

    setTimeout(() => {
      message.delete();
    }, 5000); // Delete the command message after 5 seconds
  },
};
