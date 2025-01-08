const ExpenseModel = require("../model/expense.model");
const SettleModel = require("../model/settlement.model");
const { UserModel } = require("../model/usermodel.model");

const settleExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { group_id, expense_id } = req.body;

    // console.log(userId, "userId");

    if (!userId || !group_id || !expense_id) {
      return res
        .status(400)
        .json({ msg: "User ID, Group ID, and Expense ID are required" });
    }

    const expense = await ExpenseModel.findOne({
      _id: expense_id,
      group_id,
    }).populate("split_between.user_id", "name email");

    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    const userIndex = expense.split_between.findIndex(
      (entry) => entry.user_id._id.toString() === userId.toString()
    );

    if (userIndex === -1) {
      return res.status(403).json({ msg: "User is not part of this expense" });
    }

    expense.split_between[userIndex].settle = true;

    await expense.save();

    const updatedExpense = {
      _id: expense._id,
      description: expense.description,
      group: expense.group_id.groupName || "Unknown Group",
      paid_by: expense.paid_by?.name || "Unknown User",
      totalAmount: `₹${expense.amount.toFixed(2)}`,
      splitDetails: expense.split_between.map((entry) => ({
        name: entry.user_id?.name,
        email: entry.user_id?.email,
        settle: entry.settle,
      })),
      created_at: expense.created_at,
    };

    res.status(200).json({
      msg: "Expense settled successfully",
      updatedExpense,
    });
  } catch (error) {
    console.error("Error settling expense:", error);
    res.status(503).json({ error: error.message });
  }
};

module.exports = {
  settleExpense,
};
