const express = require("express");
const { auth } = require("../middleware/auth");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getAllAcceptedFriends,
  getPendingRequests,
} = require("../controller/friendController");

const friendRouter = express.Router();

friendRouter.post("/send-request", auth, sendRequest);
friendRouter.post("/accept-request/:senderId", auth, acceptRequest);
friendRouter.post("/reject-request/:senderId", auth, rejectRequest);
friendRouter.get("/accepted", auth, getAllAcceptedFriends);
friendRouter.get("/pending", auth, getPendingRequests);

module.exports = friendRouter;
