const mongoose = require("mongoose");

const friendshipSchema = mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
});

const FriendModel = mongoose.model("Friend", friendshipSchema);

module.exports = FriendModel;
