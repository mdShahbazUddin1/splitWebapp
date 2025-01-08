const RecentActivityModel = require("../model/recentActivity.model");

const logRecentActivity = async (userId, action, details, options = {}) => {
  try {
    const { groupId, friendId, amount } = options;

    const newActivity = new RecentActivityModel({
      user_id: userId,
      action,
      details,
      group_id: groupId || null,
      friend_id: friendId || null,
      amount: amount || null,
    });

    await newActivity.save();
    console.log("Recent activity logged successfully.");
  } catch (error) {
    console.error("Error logging recent activity:", error);
  }
};

module.exports = logRecentActivity;
