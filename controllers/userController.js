// Make a function (logic)
const userModels = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const sendOtp = require("../service/sendOtp");

// 1. Creating User Function

const creatUser = async (req, res) => {
  //1. Get data from the user(fname,lname,email,pp)
  console.log(req.body);

  //#. Destructuring
  const { fullName, email, password, address, phone } = req.body;
  //2. Validation
  //2.1 If not : Send the reponse and stop the process

  if (!fullName || !email || !password || !address || !phone) {
    return res.json({
      success: false,
      message: "Please enter all fields!",
    });
  }

  // Try - Catch (Error Handling)
  try {
    //4. Check existing user
    //check if the user is already exists
    const existingUser = await userModels.findOne({ email: email });

    //4.1 if yes : Send response and stop the process
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists!",
      });
    }
    //5. if not:
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }

  //hash the password
  const randomSalt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, randomSalt);

  //If proper data
  const newUser = new userModels({
    //fields : valuse reciveced from user
    fullName: fullName,
    email: email,
    address: address,
    phone: phone,
    password: hashedPassword,
  });

  //6. Save in the database
  await newUser.save();

  //7. Send a success reponse
  res.status(200).json({
    success: true,
    message: "User Created successfully!",
  });
};

//Login User Function
const loginUser = async (req, res) => {
  //checking incoming data
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please enter all fields!",
    });
  }
  try {
    //1. find user, if not : stop the process
    const user = await userModels.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not Found",
      });
    }
    //2. Compare the password, if not :stop the process
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.json({
        success: false,
        message: "Incorrect Password",
      });
    }
    //3. generate JWT token

    //3.1 Secret Decryption key(.env)
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    //4. Send the token, userData , Message to the user
    res.json({
      success: true,
      message: "User Logged Successful!",
      token: token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const userdetail = await userModels.findById(userId);
    res.json({
      success: true,
      message: "User Fetched!",
      user: userdetail,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error!",
    });
  }
};

// Update User Function
const updateUser = async (req, res) => {
  try {
    // If there is a new profile picture, delete the old one and upload the new one
    if (req.files && req.files.profilePicture) {
      const { profilePicture } = req.files;

      // Generate a unique name for the new profile picture
      const imageName = `${Date.now()}-${profilePicture.name}`;

      // Define the path to save the new profile picture
      const imageUploadPath = path.join(
        __dirname,
        `../public/profile/${imageName}`
      );

      // Save the new profile picture
      await profilePicture.mv(imageUploadPath);

      // Update the profilePicture field with the new image name
      req.body.profilePicture = imageName;

      // Delete the old profile picture
      // Find the user information (we have the ID)
      const existingUser = await userModels.findById(req.params.id);

      // Check if there was an old profile picture
      if (existingUser.profilePicture) {
        // If a new profile picture was uploaded, remove the old one
        const oldImagePath = path.join(
          __dirname,
          `../public/profile/${existingUser.profilePicture}`
        );
        // Delete the old profile picture from the file system
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Update the user profile in the database
    const updatedUser = await userModels.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//forgot password using Phone Number
const forgotPassword = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({
      success: false,
      message: "Please provide phone number",
    });
  }
  try {
    //user find and validate
    const user = await userModels.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    //generate random otp
    const otp = Math.floor(100000 + Math.random() * 900000); //6 digit otp generated

    //update in database for verification
    user.otpReset = otp;
    user.otpResetExpires = Date.now() + 360000;
    await user.save();

    //sending otp to phonenumber
    const isSent = await sendOtp(phone, otp);

    if (!isSent) {
      return res.status(400).json({
        success: false,
        message: "Error Sending OTP",
      });
    }
    //success Message
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const verifyOtpAndSetPassword = async (req, res) => {
  const { phone, otp, password } = req.body;

  console.log("Received data:", { phone, otp, password });

  if (!phone || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide phone number, OTP, and new password!",
    });
  }

  try {
    const user = await userModels.findOne({ phone: phone });
    if (!user) {
      console.log("User not found for phone:", phone);
      return res.status(400).json({
        success: false,
        message: "User Not Found!",
      });
    }

    if (Date.now() > user.otpResetExpires) {
      console.log("OTP expired for user:", user._id);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (!user.otpReset) {
      console.log("OTP is undefined for user:", user._id);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP! Please enter the correct OTP.",
      });
    }

    if (otp !== user.otpReset.toString()) {
      console.log("Invalid OTP provided for user:", user._id);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP! Please enter the correct OTP.",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, randomSalt);
    user.password = hashPassword;

    // clear OTP fields
    user.otpReset = undefined;
    user.otpResetExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful!",
    });
  } catch (error) {
    console.log("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModels.find({});

    res.status(201).json({
      success: true,
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  //get user id
  const userID = req.params.id;
  try {
    await userModels.findByIdAndDelete(userID);
    res.status(201).json({
      succes: true,
      message: "User Deleted!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: "internal server error!",
    });
  }
};

// Update profile image
const updateProfileImage = async (req, res) => {
  const userId = req.params.id;

  if (!req.files || !req.files.profilePicture) {
    return res.status(400).json({
      success: false,
      message: "Image not found",
    });
  }

  const { profilePicture } = req.files;
  const imageName = `${Date.now()}-${profilePicture.name}`;
  const imageUploadPath = path.join(
    __dirname,
    `../public/profile/${imageName}`
  );

  try {
    await profilePicture.mv(imageUploadPath);

    const user = await userModels.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the old profile image if it exists
    if (user.profilePicture) {
      const oldImagePath = path.join(
        __dirname,
        `../public/profile/${user.profilePicture}`
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    user.profilePicture = imageName;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profilePicture: imageName,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

//exporting
module.exports = {
  creatUser,
  loginUser,
  getUser,
  updateUser,
  forgotPassword,
  verifyOtpAndSetPassword,
  getAllUsers,
  deleteUser,
  updateProfileImage,
};
