const express = require("express");
const {
  generateInviteToken,
  acceptInvite,
} = require("../controller/inviteController");
const { auth } = require("../middleware/auth");

const inviteRoute = express.Router();

inviteRoute.post("/send", auth, generateInviteToken);
inviteRoute.get("/accept/:token", acceptInvite);

module.exports = inviteRoute;
