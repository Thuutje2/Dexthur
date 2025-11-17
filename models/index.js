const DisneyCharacter = require('./disney/DisneyCharacter');
const DisneyUser = require('./disney/disneyUser');
const UserPoints = require('./disney/userPointsSchema');
const UserFavorites = require('./disney/userFavoritesSchema');
const UserNotifications = require('./disney/userNotificationsSchema');

module.exports = {
  DisneyCharacter,
  DisneyUser,
  UserPoints,
  UserFavorites,
  UserNotifications,
};
