const mongoose = require("mongoose");

const settlementSchema = mongoose.Schema({
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  expense_id: { type: mongoose.Schema.Types.ObjectId, ref: "Expense" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const SettleModel = mongoose.model("Settle", settlementSchema);

module.exports = SettleModel;
