const ForumPost = require("../models/forumPostModel");
const forumPostModel = require("../models/forumPostModel");
const User = require("../models/userModels");
const path = require("path");
const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);

// 1. Creating Post Function
const createPost = async (req, res) => {
  console.log(req.body);
  try {
    const {
      postTitle,
      postDescription,
      postTags,
      postedUser,
      postedFullname,
      postedUserPicture,
    } = req.body;
    const { postPicture } = req.files || {};

    // Validate required fields
    if (!postTitle || !postDescription || !postTags) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields!",
      });
    }

    // Convert postTags from JSON string to an array if necessary
    let tagsArray;
    if (typeof postTags === "string") {
      // Handle a single tag or a comma-separated string of tags
      tagsArray = postTags.includes(",")
        ? postTags.split(",").map((tag) => tag.trim()) // Multiple tags
        : [postTags.trim()]; // Single tag
    } else if (Array.isArray(postTags)) {
      // If postTags is already an array
      tagsArray = postTags.map((tag) => tag.trim());
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid tags format!",
      });
    }

    // Validate image upload
    if (!postPicture) {
      return res.status(400).json({
        success: false,
        message: "Image not foundsss!",
      });
    }

    const imageName = `${Date.now()}-${postPicture.name}`;
    const imageUploadPath = path.join(
      __dirname,
      `../public/forum/${imageName}`
    );

    // Move the uploaded image to the desired directory
    await postPicture.mv(imageUploadPath);

    // Create a new forum post
    const newPost = new forumPostModel({
      postPicture: imageName,
      postTitle,
      postDescription,
      postTags: tagsArray,
      postedUser: postedUser,
      postedFullname,
      postedUserPicture: postedUserPicture,
    });

    // Save the post to the database
    const post = await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await forumPostModel
      .find({})
      .populate({
        path: "postedUser",
        select: "profilePicture fullName",
      })
      .populate("postComments.user", "profilePicture fullName");

    res.status(201).json({
      success: true,
      count: posts.length,
      message: "Posts fetched successfully",
      posts: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Similar changes for getPost function

// 2. Get Post Function
const getPost = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await forumPostModel
      .findById(postId)
      .populate({
        path: "postedUser",
        select: "profilePicture fullName",
      })
      .populate("postComments.user", "profilePicture fullName");

    res.json({
      success: true,
      message: "Post Fetched!",
      post: post,
    });
  } catch (error) {
    console.log(error);
    res.json({
      succes: false,
      message: "server error!",
    });
  }
};

//get Single user posts

// 3. Edit Post Function
// 3. Edit Post Function
const editPost = async (req, res) => {
  const { postId } = req.params;
  const { ...updateData } = req.body;
  const userId = req.user.id;

  if (req.files && req.files.postPicture) {
    const { postPicture } = req.files;
    const imageName = `${Date.now()}-${postPicture.name}`;
    const imageUploadPath = path.join(
      __dirname,
      `../public/forum/${imageName}`
    );

    try {
      await postPicture.mv(imageUploadPath);
      updateData.postPicture = imageName;
    } catch (error) {
      console.log("Error moving file:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during file upload",
      });
    }
  }

  try {
    const post = await ForumPost.findById(postId);

    if (!post) {
      console.log(`Post with ID ${postId} not found.`);
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }
    console.log(`Post found. Posted by: ${post.postedUser}`);

    if (post.postedUser.toString() !== userId) {
      console.log(`User ${userId} not authorized to edit post ${postId}`);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this post!",
      });
    }

    Object.assign(post, updateData);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully!",
      post,
    });
  } catch (error) {
    console.log("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // Make sure this matches the property set by your authGuard

  try {
    console.log(`Attempting to delete post ${postId} by user ${userId}`);

    const post = await ForumPost.findById(postId);

    if (!post) {
      console.log(`Post ${postId} not found`);
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    console.log(`Post found. Posted by: ${post.postedUser}`);

    // Check if the user is the owner of the post
    if (post.postedUser.toString() !== userId) {
      console.log(`User ${userId} is not authorized to delete post ${postId}`);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post!",
      });
    }

    await ForumPost.findByIdAndDelete(postId);
    console.log(`Post ${postId} deleted successfully`);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deletePost:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 5. Add Comment to Post Function
// Add Comment to Post Function
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, comment } = req.body;

    // Validate required fields
    if (!userId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields for commentss!",
      });
    }

    // Find the forum post by ID
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Add the comment to the post
    const newComment = {
      user: userId,
      userName: user.fullName,
      comment,
      commentedAt: new Date(),
    };

    post.postComments.push(newComment);

    // Save the updated post to the database
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully!",
      post,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

const editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  try {
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    const commentToEdit = post.postComments.id(commentId);

    if (!commentToEdit) {
      return res.status(404).json({
        success: false,
        message: "Comment not found!",
      });
    }

    if (commentToEdit.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this comment!",
      });
    }

    commentToEdit.comment = comment;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully!",
      post,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;

  try {
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    const commentIndex = post.postComments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Comment not found!",
      });
    }

    if (post.postComments[commentIndex].user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment!",
      });
    }

    post.postComments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully!",
      post,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

const getDetails = async (req, res) => {
  try {
    const user = await user.findById(req.params._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
      res.json({ firstName: user.firstName, lastName: user.lastName });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const postPagination = async (req, res) => {
  //Resultperpage
  const resultPerPage = req.query.limit;

  // page no (recieved from user)
  const pageNo = req.query.page;

  // Sorting option (received from user)
  const sortOption = req.query.sort || "mostRecent"; // Default to 'mostRecent'

  // Determine the sort field and order
  let sortField;
  let sortOrder;

  switch (sortOption) {
    case "mostRecent":
      sortField = "postedTime";
      sortOrder = -1; // Descending
      break;
    case "oldest":
      sortField = "postedTime";
      sortOrder = 1; // Ascending
      break;
    case "mostLiked":
      sortField = "postLikes";
      sortOrder = -1;
      break;
    case "mostViews":
      sortField = "postViews"; // Aggregate comments length
      sortOrder = -1; // Descending
      break;
    default:
      sortField = "postedTime";
      sortOrder = -1; // Default to mostRecent
  }

  try {
    const posts = await forumPostModel
      .find({})
      .skip((pageNo - 1) * resultPerPage)
      .limit(resultPerPage)
      .sort({ [sortField]: sortOrder })
      .populate({
        path: "postedUser",
        select: "profilePicture fullName",
      })
      .populate("postComments.user", "profilePicture fullName");

    // if there is no product
    if (posts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No post Found",
      });
    }
    res.status(201).json({
      success: true,
      message: "Post fetched",
      posts: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const searchProduct = async (req, res) => {
  const searchQuery = req.query.q || "";
  const searchCategory = req.query.tags || "";
  try {
    const filter = {};

    if (searchQuery) {
      filter.postTitle = { $regex: searchQuery, $options: "i" };
    }

    // If searchCategory is not empty
    if (searchCategory) {
      filter.postTags = { $regex: searchCategory, $options: "i" };
    }

    // Find products
    const posts = await forumPostModel.find(filter);
    res.status(200).json({
      success: true,
      message: "Posts Fetched!",
      posts: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};

const likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    post.postLikes += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post liked successfully!",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const dislikePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    post.postDislikes += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post disliked successfully!",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const viewPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    post.postViews += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post viewed successfully!",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Fetch all posts by logged-in user
const getUserPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const posts = await forumPostModel
      .find({ postedUser: userId })
      .populate({
        path: "postedUser",
        select: "profilePicture fullName",
      })
      .populate("postComments.user", "profilePicture fullName");

    if (!posts.length) {
      return res.status(404).json({
        success: false,
        message: "No posts found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully!",
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Fetch all comments by logged-in user
const getUserComments = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await forumPostModel
      .find({ "postComments.user": userId })
      .populate({
        path: "postedUser",
        select: "profilePicture fullName",
      })
      .populate("postComments.user", "profilePicture fullName");

    // Extract comments made by the user
    const userComments = posts.flatMap((post) =>
      post.postComments.filter((comment) => comment.user.toString() === userId)
    );

    if (!userComments.length) {
      return res.status(404).json({
        success: false,
        message: "No comments found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully!",
      comments: userComments,
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Fetch Google Play Games Store information using SerpApi
const getGameInfo = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Query parameter is required!",
    });
  }

  const params = {
    engine: "google_play",
    q: query,
    hl: "en", // Language (optional)
    gl: "us", // Country (optional)
  };

  try {
    search.json(params, (data) => {
      res.status(200).json({
        success: true,
        message: "Game data fetched successfully!",
        data: data,
      });
    });
  } catch (error) {
    console.error("Error fetching game data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Exporting the functions
module.exports = {
  createPost,
  getAllPosts,
  getPost,
  editPost,
  deletePost,
  addComment,
  deleteComment,
  getDetails,
  postPagination,
  searchProduct,
  likePost,
  dislikePost,
  viewPost,
  editComment,
  getUserComments,
  getUserPosts,
  getGameInfo,
};
