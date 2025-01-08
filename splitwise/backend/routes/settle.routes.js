const express = require("express");
const { auth } = require("../middleware/auth");
const { settleExpense } = require("../controller/settleController");

const settleRoute = express.Router();

settleRoute.post("/settle-expense", auth, settleExpense);

module.exports = settleRoute;
