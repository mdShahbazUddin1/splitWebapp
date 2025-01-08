const mongoose = require("mongoose");

const recentActivitySchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String, required: true },
  details: { type: String, required: true },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  friend_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  amount: { type: Number, default: null },
  date: { type: Date, default: Date.now },
});

const RecentActivityModel = mongoose.model(
  "RecentActivity",
  recentActivitySchema
);

module.exports = RecentActivityModel;
