const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  paid_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  split_between: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      settle: { type: Boolean, default: false },
      lent_Amount: { type: Number, dafault: 0 },
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const ExpenseModel = mongoose.model("Expense", expenseSchema);

module.exports = ExpenseModel;
