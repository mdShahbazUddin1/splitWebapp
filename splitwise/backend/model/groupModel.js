const mongoose = require("mongoose");

const defaultImages = [
  "https://images.unsplash.com/photo-1631582053308-40f482e7ace5?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1602212096437-d0af1ce0553e?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1575&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      added_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      added_at: { type: Date, default: Date.now },
    },
  ],
  groupImage: {
    type: String,
    default: function () {
      return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    },
  },
  groupType: {
    type: String,
    enum: ["Home", "Trip", "Couple", "Other"],
    required: true,
    default: "Home",
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const GroupModel = mongoose.model("Group", groupSchema);

module.exports = GroupModel;
