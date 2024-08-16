const mongoose = require("mongoose");

// Defining the user schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String, // URL to the profile picture
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  otpReset: {
    type: Number,
    default: null,
  },
  otpResetExpires: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
