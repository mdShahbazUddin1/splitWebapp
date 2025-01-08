const { UserModel } = require("../model/usermodel.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getAuth } = require("firebase-admin/auth");
const admin = require("firebase-admin");
const serviceAccountKey = require("../split-e99d6-firebase-adminsdk-xv47j-fc806ac5d4.json");
const { BlackListModel } = require("../model/blacklist");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .send({ msg: "Name, Email and Password are required field !" });
    }

    const isUserExist = await UserModel.findOne({ email });

    if (isUserExist)
      return res.status(401).send({ msg: "User email id is already register" });

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ name, email, password: hashPassword });

    await newUser.save();

    res.status(200).send({
      msg: "Reister Success",
      newUser,
    });
  } catch (error) {
    res.status(503).send({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send({ msg: "Email and Password required" });

    const isUser = await UserModel.findOne({ email });

    if (!isUser)
      res
        .status(401)
        .send({ msg: "Email is not register please register to login" });

    const isPasswordValid = await bcrypt.compare(password, isUser.password);

    if (!isPasswordValid)
      restart.status(401).send({ msg: "Email or Password is incorrect" });

    const token = await jwt.sign(
      {
        userId: isUser._id,
        email: isUser.email,
      },
      process.env.JWT_ACCESS_TOKEN
    );

    res.status(200).send({ msg: "Login Success", token });
  } catch (error) {
    res
      .status(503)
      .send({ msg: "Internal Server Error", error: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;
    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;
    const modifiedPicture = picture.replace("s96-c", "s384-c");

    if (req.session.user) {
      const user = req.session.user;
      const token = jwt.sign(
        { userId: user._id, email: email },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: "1h" }
      );
      return res.status(200).json({ user, token });
    } else {
      let user = await UserModel.findOne({ email });

      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This account was signed up without using Google. Please login with email & password.",
          });
        }
      } else {
        user = new UserModel({
          name: name,
          email,
          profile_image: modifiedPicture,
          google_auth: true,
        });

        try {
          await user.save();
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
      }

      req.session.user = user;
      const token = jwt.sign(
        { userId: user._id, email: email },
        process.env.JWT_ACCESS_TOKEN, // Secret key stored in environment variable
        { expiresIn: "1h" } // Optional: you can set an expiration time for the token (1 hour in this case)
      );

      return res.status(200).json({ user, token });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to log in using Google. Please try again." });
  }
};

const getLoggedInUser = async (req, res) => {
  try {
    const userId = req.userId;

    const getUser = await UserModel.findById({ _id: userId });
    res.status(200).send(getUser);
  } catch (error) {
    res.status(503).send({ msg: "Server Error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ msg: "Token is invalid or not provided" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ msg: "Token is invalid or not provided" });
    }
    const BlackListToken = new BlackListModel({
      token: token,
    });

    await BlackListToken.save();

    return res.status(200).json({ msg: "Logout success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getLoggedInUser,
  logout,
};
