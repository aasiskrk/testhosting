const router = require("express").Router();
const forumControllers = require("../controllers/forumPostController");
const { authGuard } = require("../middleware/authGuard");

// Create a post
router.post("/create", forumControllers.createPost);

//get all posts
router.get("/get_all_post", forumControllers.getAllPosts);

// Get a single post by ID
router.get("/get_single_post/:id", forumControllers.getPost);

// Edit a post by ID
router.put("/edit_post/:postId", authGuard, forumControllers.editPost);

// Delete a post by ID
router.delete("/delete_post/:postId", authGuard, forumControllers.deletePost);

// Add a comment to a post
router.post("/add_comment/:postId", forumControllers.addComment);

// Edit a comment
router.put(
  "/edit_comment/:postId/:commentId",
  authGuard,
  forumControllers.editComment
);

router.get("/pagination", forumControllers.postPagination);

// Delete a comment from a post
router.delete(
  "/delete_comment/:postId/:commentId",
  authGuard,
  forumControllers.deleteComment
);

router.get("/getDetails/:id", forumControllers.getDetails);

router.get("/search", forumControllers.searchProduct);

// New routes for likes, dislikes, and views
router.post("/:postId/like", forumControllers.likePost);
router.post("/:postId/dislike", forumControllers.dislikePost);
router.post("/:postId/view", forumControllers.viewPost);

// Get all posts by logged-in user
router.get("/user_posts/:id", authGuard, forumControllers.getUserPosts);

// Get all comments by logged-in user
router.get("/user_comments/:id", forumControllers.getUserComments);

router.get("/games", forumControllers.getGameInfo);

// Exporting the router
module.exports = router;
