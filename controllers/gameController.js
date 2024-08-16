const Game = require("../models/gameModel");
const path = require("path");
const fs = require("fs");

// 1. Creating Game Function
const createGame = async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  const { gameTitle, developerName, description } = req.body;

  // 2. Validation
  if (!gameTitle || !developerName || !description) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fieldss!",
    });
  }

  if (!req.files || !req.files.gameThumbnail) {
    return res.status(400).json({
      success: false,
      message: "Game thumbnail not found!",
    });
  }

  const { gameThumbnail } = req.files;

  // Uploading
  const imageName = `${Date.now()}-${gameThumbnail.name}`;
  const imageUploadPath = path.join(__dirname, `../public/games/${imageName}`);

  try {
    await gameThumbnail.mv(imageUploadPath);

    const newGame = new Game({
      gameTitle,
      developerName,
      description,
      gameThumbnail: imageName,
    });

    const game = await newGame.save();
    res.status(201).json({
      success: true,
      message: "Game created successfully!",
      data: game,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// 2. Fetching All Games
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find({});
    res.status(200).json({
      success: true,
      message: "Games fetched successfully",
      games: games,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 3. Fetching a Single Game
const getGame = async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await Game.findById(gameId);
    res.status(200).json({
      success: true,
      message: "Game fetched successfully!",
      game: game,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4. Updating Game
const updateGame = async (req, res) => {
  try {
    if (req.files && req.files.gameThumbnail) {
      const { gameThumbnail } = req.files;
      const imageName = `${Date.now()}-${gameThumbnail.name}`;
      const imageUploadPath = path.join(
        __dirname,
        `../public/games/${imageName}`
      );

      await gameThumbnail.mv(imageUploadPath);
      req.body.gameThumbnail = imageName;

      const existingGame = await Game.findById(req.params.id);

      if (existingGame.gameThumbnail) {
        const oldImagePath = path.join(
          __dirname,
          `../public/games/${existingGame.gameThumbnail}`
        );
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Game updated successfully!",
      updatedGame: updatedGame,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// 5. Deleting Game
const deleteGame = async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await Game.findById(gameId);

    if (game.gameThumbnail) {
      const imagePath = path.join(
        __dirname,
        `../public/games/${game.gameThumbnail}`
      );
      fs.unlinkSync(imagePath);
    }

    await Game.findByIdAndDelete(gameId);
    res.status(200).json({
      success: true,
      message: "Game deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// Exporting
module.exports = {
  createGame,
  getAllGames,
  getGame,
  updateGame,
  deleteGame,
};
