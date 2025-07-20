const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // 'number', 'bonus', 'freeze', 'secondChance', 'flipThree'
    value: { type: Number, required: false }, // alleen nodig bij 'number'
  },
  { _id: false }
);

const Flip7GameSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  roundPoints: { type: Number, default: 0 },
  flippedNumbers: { type: [Number], default: [] },
  specialCards: {
    secondChance: { type: Boolean, default: false },
    freeze: { type: Boolean, default: false },
  },
  deck: { type: [CardSchema], default: [] },
  currentTurn: { type: String, enum: ['player', 'ai'], default: 'player' },
  aiState: {
    roundPoints: { type: Number, default: 0 },
    flippedNumbers: { type: [Number], default: [] },
    specialCards: {
      secondChance: { type: Boolean, default: false },
    },
  },
});

module.exports = mongoose.model('Flip7Game', Flip7GameSchema);
