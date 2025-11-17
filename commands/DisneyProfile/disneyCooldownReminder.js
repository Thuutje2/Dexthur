const { getCooldownTime } = require('../../cooldown');
const { EmbedBuilder } = require('@discordjs/builders');
const { UserPoints, UserNotifications } = require('../../models/index');

module.exports = {
  name: 'disneyCooldownReminder',
  description:
    'Show the remaining time until the user can guess again or toggle notifications.',
  aliases: ['dcr'],
  async execute(message, args) {
    try {
      let targetUser = message.mentions.users.first() || message.author;

      // Get the user's profile data from the user_points collection
      const profile = await UserPoints.findOne({ user_id: targetUser.id });

      // If the profile does not exist, give a message and stop the execution of the command
      if (!profile) {
        return message.reply(
          'This user has not played the Disney Character Guessing Game yet.'
        );
      }

      // Get notification setting for the user
      const notification = await UserNotifications.findOne({
        user_id: targetUser.id,
      });

      // Check if the command is to toggle notifications
      if (args[0] && args[0].toLowerCase() === 'guess') {
        if (notification) {
          // If notifications are already on, turn them off
          await UserNotifications.findOneAndUpdate(
            { user_id: targetUser.id },
            {
              notifications_disney_guess:
                !notification.notifications_disney_guess,
            }
          );
          const status = notification.notifications_disney_guess
            ? '🔕 Notifications turned off.'
            : '🔔 Notifications turned on.';
          return message.reply(status);
        } else {
          // If the user doesn't have a notification setting, create one with notifications off
          await UserNotifications.create({
            user_id: targetUser.id,
            notifications_disney_guess: false,
          });
          return message.reply(
            '🔕 Notifications turned off. Use `!dcr guess` again to turn them on.'
          );
        }
      }

      // Convert last guess dates to Date objects
      const lastCorrectGuessDate = new Date(profile.last_correct_guess_date);
      const lastFailedGuessDate = new Date(profile.last_failed_guess_date);

      // Determine which cooldown we should use
      const now = new Date();
      const lastRelevantGuessDate =
        lastFailedGuessDate > lastCorrectGuessDate
          ? lastFailedGuessDate
          : lastCorrectGuessDate;

      // Get the cooldown information
      const cooldown = getCooldownTime(lastRelevantGuessDate);

      // Determine the notification icon based on the user's preference
      const notificationIcon =
        notification && notification.notifications_disney_guess ? '🔔' : '🔕';

      // Build an embed with the profile data
      const embed = new EmbedBuilder()
        .setTitle('Cooldown Reminder')
        .setColor(0x0099ff)
        .setTimestamp()
        .addFields({
          name: '⏳ Next Guess Available In',
          value: `${notificationIcon} ${cooldown.remainingMinutes} minutes`,
        });

      // Send the embed to the user
      message.channel.send({ embeds: [embed] });

      // Check if the user has notifications enabled and send a DM when the cooldown is over
      if (notification && notification.notifications_disney_guess) {
        const cooldownTimeInMilliseconds =
          cooldown.remainingMinutes * 60 * 1000; // Convert to milliseconds
        setTimeout(() => {
          targetUser.send(
            '🎉 Your cooldown period is over! You can now guess again! 🎉'
          );
        }, cooldownTimeInMilliseconds);
      }
    } catch (error) {
      console.error('Error occurred in disneyCooldownReminder command', error);
      message.reply(
        'An error occurred while fetching the profile. Please try again later.'
      );
    }
  },
};
