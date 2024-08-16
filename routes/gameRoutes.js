// Importing only router as you don't need the whole express
const router = require("express").Router();
const gameController = require("../controllers/gameController");
const { authGuard, adminGuard } = require("../middleware/authGuard");

// Create a new game
router.post("/create", gameController.createGame);

// Fetch all games
// http://localhost:5000/api/game/get_all_games
router.get("/get_all_games", gameController.getAllGames);

// Fetch a single game
router.get("/get_single_game/:id", gameController.getGame);

// Delete a game
router.delete("/delete_game/:id", gameController.deleteGame);

// Update a game
router.put("/update_game/:id", gameController.updateGame);

// Exporting
module.exports = router;
