const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema({
  postPicture: {
    type: String,
    required: true,
  },
  postTitle: {
    type: String,
    required: true,
  },
  postDescription: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  postTags: [
    {
      type: String,
      required: true,
    },
  ],
  postComments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Refers to the User model
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      commentedAt: {
        type: Date,
        default: Date.now,
      },
      userName: {
        type: String,
        required: true,
      },
    },
  ],
  postLikes: {
    type: Number,
    default: 0,
  },
  postDislikes: {
    type: Number,
    default: 0,
  },
  postViews: {
    type: Number,
    default: 0,
  },
  postedTime: {
    type: Date,
    default: Date.now,
  },
  postedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Refers to the User model
    required: true,
  },
  postedFullname: {
    type: String,
    required: true,
  },
});

// Adding an index to improve query performance
forumPostSchema.index({ postTitle: "text", postTags: "text" });

// Adding a virtual to get the comment count
forumPostSchema.virtual("commentCount").get(function () {
  return this.postComments.length;
});

// Exporting the model
const ForumPost = mongoose.model("ForumPost", forumPostSchema);
module.exports = ForumPost;
