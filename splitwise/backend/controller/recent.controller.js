const RecentActivityModel = require("../model/recentActivity.model");

const getRecentActivities = async (req, res) => {
  try {
    const userId = req.userId;

    const activities = await RecentActivityModel.find({ user_id: userId })
      .sort({ date: -1 })
      .populate("group_id", "name")
      .populate("friend_id", "name email");

    if (!activities.length) {
      return res.status(404).json({ message: "No recent activities found." });
    }

    const formattedActivities = activities.map((activity) => ({
      action: activity.action,
      details: activity.details,
      amount: activity.amount ? `₹${activity.amount.toFixed(2)}` : null,
      date: activity.date.toLocaleDateString("en-GB", { weekday: "long" }),
    }));

    return res.status(200).json({
      message: "Recent activities retrieved successfully.",
      activities: formattedActivities,
    });
  } catch (error) {
    console.error("Error retrieving recent activities:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = { getRecentActivities };
