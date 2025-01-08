const mongoose = require("mongoose");

const inviteTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    group_id: {
      type: String,
      required: false,
    },
    recipient_email: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const InviteTokenModel = mongoose.model("InviteToken", inviteTokenSchema);

module.exports = InviteTokenModel;
