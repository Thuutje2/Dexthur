module.exports = {
    name: 'clear',
    permissions: ["ADMINISTRATOR", "MANAGE_MESSAGES"], // Add MANAGE_MESSAGES permission
    description: 'Clear a specified number of messages.',
    execute(message, args) {
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.channel.send('Please provide a number between 1 and 100.');
        }

        // Check if the member has the necessary permissions
        if (!message.member.permissions.has("MANAGE_MESSAGES")) {
            return message.channel.send("You don't have permission to manage messages.");
        }

        try {
            message.channel.bulkDelete(amount, true)
                .then(messages => {
                    message.channel.send(`Successfully cleared ${messages.size} messages.`).then(msg => msg.delete({ timeout: 5000 }));
                });
        } catch (error) {
            console.error(error);
            message.channel.send('An error occurred while clearing messages.');
        }
    },
};

