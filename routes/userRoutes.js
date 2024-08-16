//importing only router as u dont need the whole express

const router = require("express").Router();
const userContollers = require("../controllers/userController");
const { authGuard, adminGuard } = require("../middleware/authGuard");

//Make a create user API

router.post("/create", userContollers.creatUser);

//login User API
router.post("/login", userContollers.loginUser);

//get details for profile

router.get("/get_user/:id", authGuard, userContollers.getUser);

router.put("/update_profile/:id", userContollers.updateUser);

router.post("/forgot_password", userContollers.forgotPassword);

router.post("/verify_otp", userContollers.verifyOtpAndSetPassword);

router.get("/get_all_users", userContollers.getAllUsers);

router.delete("/delete_user/:id", userContollers.deleteUser);

router.put('/update_user_image/:id', userContollers.updateProfileImage);


//exporting
module.exports = router;
