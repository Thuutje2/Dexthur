const mongoose = require('mongoose');

const userFavoritesSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    favorite_character_name: {
      type: String,
      default: null,
    },
    favorite_series_film: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserFavorites', userFavoritesSchema);
