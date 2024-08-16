const axios = require("axios");

const sendOtp = async (phone, otp) => {
  let isSent = false;

  //third party service proviedr
  const url = "https://api.managepoint.co/api/sms/send";

  // required payload managepoint.co/api-documentation
  const payload = {
    apiKey: process.env.OTP_API,
    to: phone,
    message: `Your otp for verification is: ${otp}`,
  };

  try {
    const res = await axios.post(url, payload);
    if (res.status === 200) {
      isSent = true;
    }
  } catch (error) {
    console.log("OTP sending fail:", error.message);
  }
  return isSent;
};

module.exports = sendOtp;
