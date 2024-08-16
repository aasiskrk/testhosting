const mongoose = require("mongoose");

// Defining the game schema
const gameSchema = new mongoose.Schema({
  gameTitle: {
    type: String,
    required: true,
  },
  gameThumbnail: {
    type: String, // URL to the game thumbnail
    required: true,
  },
  developerName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Game = mongoose.model("Game", gameSchema);
module.exports = Game;
