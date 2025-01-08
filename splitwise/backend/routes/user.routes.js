const express = require("express");
const {
  register,
  login,
  googleAuth,
  getLoggedInUser,
  logout,
} = require("../controller/user.controller");
const { auth } = require("../middleware/auth");
const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/google_login", googleAuth);
userRouter.get("/getLoggedInUser", auth, getLoggedInUser);
userRouter.get("/logout", auth, logout);

module.exports = { userRouter };
