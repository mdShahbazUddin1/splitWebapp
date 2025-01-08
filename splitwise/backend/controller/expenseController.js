const logRecentActivity = require("../middleware/logActivities");
const ExpenseModel = require("../model/expense.model");
const GroupModel = require("../model/groupModel");

const addExpense = async (req, res) => {
  const userId = req.userId;
  try {
    const { group_id, amount, description } = req.body;

    const group = await GroupModel.findById(group_id).populate(
      "members.user_id"
    );

    if (!group) {
      return res.status(404).send({ error: "Group not found" });
    }
    const numberOfMembers = group.members.length + 1;
    const amountPerMember = amount / numberOfMembers;
    const split_between = group.members.map((member) => ({
      user_id: member.user_id,
      settle: false,
      lent_Amount: amountPerMember,
    }));

    // Create a new expense
    const newExpense = new ExpenseModel({
      group_id,
      paid_by: userId,
      amount,
      description,
      split_between,
    });

    // Save the new expense to the database
    const savedExpense = await newExpense.save();

    // Log recent activity for the user who added the expense
    await logRecentActivity(
      userId,
      "added expense",
      `You added "${description}" in group "${group.groupName}".`,
      { group_id, amount }
    );

    // Respond with success
    res
      .status(201)
      .send({ msg: "Expense created successfully", expense: savedExpense });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllExpense = async (req, res) => {
  try {
    const expenses = await ExpenseModel.find()
      .populate("group_id", "groupName members")
      .populate("paid_by", "name email")
      .populate("split_between.user_id", "name email");

    if (expenses.length === 0)
      return res.status(201).send({ msg: "No Expense Found" });

    const formattedExpenses = expenses.map((expense) => {
      const totalAmount = expense.amount;
      const groupMembers = expense.group_id?.members || [];
      const splitBetween = expense.split_between || [];
      const payer = expense.paid_by;

      // Ensure payer is added correctly if not already in split_between
      if (
        payer &&
        !splitBetween.some(
          (member) => member.user_id.toString() === payer._id.toString()
        )
      ) {
        splitBetween.push({ user_id: payer._id, settle: false });
      }

      const numberOfSplitUsers = splitBetween.length;
      const perPersonAmount =
        numberOfSplitUsers > 0 ? totalAmount / numberOfSplitUsers : 0;

      // Calculate and update the lent amount for each user
      const splitDetails = groupMembers
        .map((member) => {
          if (!member || !member.user_id) {
            console.warn("Invalid member:", member);
            return null;
          }

          // Find the user's split details from the split_between array
          const userSplitDetails = splitBetween.find(
            (splitMember) =>
              splitMember.user_id._id.toString() ===
              member.user_id._id.toString()
          );

          const settleStatus = userSplitDetails
            ? userSplitDetails.settle
            : false;
          const isPayer = member.user_id.toString() === payer._id.toString();
          const isSplitUser = splitBetween.some(
            (splitMember) =>
              splitMember.user_id.toString() === member.user_id.toString()
          );

          let lentAmount = perPersonAmount;

          // Check the existing lentAmount in split_between
          if (userSplitDetails && userSplitDetails.lent_Amount > 0) {
            lentAmount = userSplitDetails.lent_Amount;
          }

          if (isPayer && settleStatus) {
            // Payer has already settled, so they don't need to pay more
            lentAmount = 0;
          } else if (isPayer && !settleStatus) {
            // Payer still needs to contribute to the full amount
            lentAmount = perPersonAmount;
          } else if (isSplitUser && !settleStatus) {
            // Non-payer members owe the full amount
            lentAmount = perPersonAmount;
          } else if (isSplitUser && settleStatus) {
            // If a user is settled, they owe less based on what they've already paid
            lentAmount = Math.max(
              perPersonAmount - userSplitDetails.lent_Amount,
              0
            );
          }

          return {
            name: member.name || "Unknown",
            email: member.email || "Unknown",
            lentAmount: `₹ ${lentAmount.toFixed(2)}`,
            settle: settleStatus,
          };
        })
        .filter(Boolean); // Filter out null values

      return {
        _id: expense._id,
        description: expense.description,
        group: expense.group_id?.groupName || "Unknown Group",
        paid_by: payer?.name || "Unknown User",
        totalAmount: `₹${totalAmount.toFixed(2)}`,
        splitDetails,
        created_at: expense.created_at,
      };
    });

    res.status(200).send(formattedExpenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(503).send({ error: error.message });
  }
};

const deleteParticularGroupExpense = async (req, res) => {
  try {
    const { group_id, expense_id } = req.body;
    const userId = req.userId;

    // Check if group_id and expense_id are provided
    if (!group_id || !expense_id) {
      return res
        .status(400)
        .json({ message: "Group ID and Expense ID are required" });
    }

    // Find the expense by expense_id
    const expense = await ExpenseModel.findById(expense_id);

    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if the expense belongs to the specified group
    if (expense.group_id.toString() !== group_id) {
      return res
        .status(400)
        .json({ message: "Expense does not belong to this group" });
    }

    // Check if the user is the one who created the expense
    if (expense.paid_by.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own expenses" });
    }

    // Delete the expense
    await ExpenseModel.findByIdAndDelete(expense_id);

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateParticularGroupExpense = async (req, res) => {
  try {
    const { group_id, expense_id, updatedExpense } = req.body;
    const userId = req.userId;

    // Check if group_id, expense_id, and updatedExpense are provided
    if (!group_id || !expense_id || !updatedExpense) {
      return res.status(400).json({
        message: "Group ID, Expense ID, and updated data are required",
      });
    }

    // Find the expense by expense_id
    const expense = await ExpenseModel.findById(expense_id);

    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if the expense belongs to the specified group
    if (expense.group_id.toString() !== group_id) {
      return res
        .status(400)
        .json({ message: "Expense does not belong to this group" });
    }

    // Check if the user is the one who created the expense
    if (expense.paid_by.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own expenses" });
    }

    // Calculate the difference between the updated amount and the original amount
    const amountDifference = updatedExpense.amount - expense.amount;

    // If the amount has changed, we need to adjust the split_between array
    if (updatedExpense.amount && updatedExpense.amount !== expense.amount) {
      console.log("Updating expense amount...");

      // Calculate the new split amount, including one extra member (expense creator)
      const totalMembers = expense.split_between.length + 1; // Include the creator
      const newSplitAmount = updatedExpense.amount / totalMembers;

      // Map through split_between and update the lent_Amount and settle status
      const updatedSplitBetween = expense.split_between.map((member) => {
        // If the member has already settled, adjust their lent_Amount
        if (member.settle) {
          console.log(
            `Processing settled member with user_id: ${member.user_id}`
          );

          // Calculate how much they still owe (subtract already paid amount)
          const remainingAmount = Math.max(
            newSplitAmount - member.lent_Amount,
            0
          );

          member.lent_Amount = remainingAmount;
          member.settle = false; // Update settle to false, as they still owe
          console.log(`Remaining amount for settled user: ${remainingAmount}`);
        } else {
          // If the member hasn't settled, they owe the full new split amount
          member.lent_Amount = newSplitAmount;
        }

        return member;
      });

      // Save the updated split_between array to the expense document
      expense.split_between = updatedSplitBetween;
      await expense.save(); // Persist the changes
    }

    // Now update the expense record with the new details (including updatedExpense)
    const updatedExpenseRecord = await ExpenseModel.findByIdAndUpdate(
      expense_id,
      { $set: updatedExpense },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpenseRecord,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  addExpense,
  getAllExpense,
  deleteParticularGroupExpense,
  updateParticularGroupExpense,
};
