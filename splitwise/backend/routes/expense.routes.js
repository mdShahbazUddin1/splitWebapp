const express = require("express");
const {
  addExpense,
  getAllExpense,
  deleteParticularGroupExpense,
  updateParticularGroupExpense,
} = require("../controller/expenseController");
const { auth } = require("../middleware/auth");

const expenseRoute = express.Router();

expenseRoute.post("/add", auth, addExpense);
expenseRoute.get("/get", auth, getAllExpense);
expenseRoute.delete("/delete", auth, deleteParticularGroupExpense);
expenseRoute.put("/update", auth, updateParticularGroupExpense);

module.exports = expenseRoute;
