const express = require("express");
const { getRecentActivities } = require("../controller/recent.controller");
const { auth } = require("../middleware/auth");
const recentRouter = express.Router();

recentRouter.get("/get", auth, getRecentActivities);

module.exports = recentRouter;
