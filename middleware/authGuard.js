const jwt = require("jsonwebtoken");

const authGuard = (req, res, next) => {
  // console.log(req.headers);
  //check incoming data
  const authHeader = req.headers.authorization;
  //get auth headers (content type, authorization, ...)
  //get authorization
  //if not found stop the process (res)
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "Authorization header not found!",
    });
  }

  //authorization format : 'Bearer tokendasad'
  //get only token by splitting by space (0-bearer , 1- token)
  const token = authHeader.split(" ")[1];

  //if token not found or mismatch (stop the process (res))
  if (!token || token === "") {
    return res.status(400).json({
      success: false,
      message: "token is missing!",
    });
  }
  //verify the token
  //if verified, next
  //not : not authenticated response
  try {
    //verify the token and get user information
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Not Authenticated!",
    });
  }
};

//admin guard
const adminGuard = (req, res, next) => {
  console.log(req.headers);
  //check incoming data
  const authHeader = req.headers.authorization;
  //get auth headers (content type, authorization, ...)
  //get authorization
  //if not found stop the process (res)
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "Authorization header not found!",
    });
  }

  //authorization format : 'Bearer tokendasad'
  //get only token by splitting by space (0-bearer , 1- token)
  const token = authHeader.split(" ")[1];

  //if token not found or mismatch (stop the process (res))
  if (!token || token === "") {
    return res.status(400).json({
      success: false,
      message: "token is missing!",
    });
  }
  //verify the token
  //if verified, next
  //not : not authenticated response
  try {
    //verify the token and get user information
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;

    //check user is admin or not
    if (!req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Permission denied!",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Not Authenticated!",
    });
  }
};
module.exports = {
  authGuard,
  adminGuard,
};
