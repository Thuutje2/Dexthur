const mongoose = require('mongoose');

const disneyCharacterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    series_film: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    hints: {
      type: [String],
      default: [],
    },
    is_new: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
disneyCharacterSchema.index({ name: 1 });
disneyCharacterSchema.index({ series_film: 1 });
disneyCharacterSchema.index({ is_new: 1 });

module.exports = mongoose.model('DisneyCharacter', disneyCharacterSchema);
