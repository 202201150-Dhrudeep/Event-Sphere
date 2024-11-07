const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const UserProfile = require("../Models/UserProfile");
const OTP = require("../Models/OTP");
const College = require("../Models/College");
const mailSender = require("../utils/mailsender");
const { VERIFICATION_EMAIL_TEMPLATE } = require("../utils/emailTemplates");
const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: "eventsphereandteam@gmail.com",
      pass: "sxuk srwu azmt dtly",
  },
});

// const bcrypt = require("bcrypt")


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the provided password matches the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, "TeamDoIt", {
      expiresIn: "1h", // Set token expiry as needed
    });

    // Respond with the token and user information if needed
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }

};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    console.log(req.body);
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password, saltRounds);

    const existingUser = await User.findOne({ email });

    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const profileDetails = await UserProfile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumer: null,
    });

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    });

    newUser.save()
            .then((result) => { 
              sendotpVerificationEmail(result, res); })
            .catch((err) => {
                console.log(err);
                res.send("Sign up error!!!!");
            });
            // await newUser.save();
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

const sendotpVerificationEmail = async ({ _id, email }, res) => {
  try {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

      const mailOptions = {
          from: "eventsphereandteam@gmail.com",
          to: email,
          subject: "Verify Your Email",
          html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp)
      };

      const saltRounds = 10;
      const hashedOTP = await bcrypt.hash(otp, saltRounds);
      const newotpVerification = new OTP({
          userId: _id,
          otp: hashedOTP,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000,
      });

      await newotpVerification.save();
      await transporter.sendMail(mailOptions);
      console.log("Smit - 4");
      res.json({
          status: "PENDING",
          message: "Verification otp email sent",
          data: {
              userId: _id,
              email: email,
          },
      });
  } catch (error) {
      res.json({
          status: "FAILED",
          message: error.message,
      });
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
      const { userId, otp } = req.body;
      // console.log(userId)
      // console.log(otp);
      if (!userId || !otp) {
          throw new Error("Empty OTP details are not allowed");
      }

      // Find OTP records for the user
      const userOTPRecords = await OTP.find({ userId });

      if (userOTPRecords.length <= 0) {
          throw new Error("Account record doesn't exist or has been verified already. Please sign up or log in.");
      }

      const expiresAt = userOTPRecords[0].expiresAt;
      const hashedOTP = userOTPRecords[0].otp;

      if (expiresAt < Date.now()) {
          await otpVerification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
      }

      // Verify the OTP
      const validOTP = await bcrypt.compare(otp, hashedOTP);
      if (!validOTP) {
          throw new Error("Invalid OTP. Please try again.");
      }
      // await User.updateOne({ _id: userId }, { isVerified: true });

      await OTP.deleteMany({ userId });

      res.json({
          status: "VERIFIED",
          message: "User email verified successfully."
      });
  } catch (error) {
      res.json({
          status: "FAILED",
          message: error.message,
      });
  }
}