const logRecentActivity = require("../middleware/logActivities");
const FriendModel = require("../model/friends.model");
const { UserModel } = require("../model/usermodel.model");

const sendRequest = async (req, res) => {
  const senderId = req.userId;
  try {
    const { receiverEmail } = req.body;

    if (!senderId || !receiverEmail)
      return res
        .status(400)
        .send({ msg: "Sender and reciever emails are required" });

    const sender = await UserModel.findById(senderId);
    const receiver = await UserModel.findOne({ email: receiverEmail });
    if (!sender || !receiver) {
      return res.status(404).json({ message: "User(s) not found." });
    }
    const existingRequest = await FriendModel.findOne({
      sender_id: sender._id,
      receiver_id: receiver._id,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Friend request already exists." });
    }

    const newRequest = new FriendModel({
      sender_id: sender._id,
      receiver_id: receiver._id,
      status: "pending",
    });

    await newRequest.save();
    res.status(200).json({ message: "Friend request sent successfully." });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const getPendingRequests = async (req, res) => {
  const receiverId = req.userId;

  try {
    const pendingRequests = await FriendModel.find({
      receiver_id: receiverId,
      status: "pending",
    })
      .populate("sender_id", "name email _id")
      .populate("receiver_id", "name email");

    if (!pendingRequests.length) {
      return res
        .status(404)
        .json({ message: "No pending friend requests found." });
    }

    const formattedRequests = pendingRequests.map((request) => ({
      requestId: request._id,
      sender: {
        id: request.sender_id._id,
        name: request.sender_id.name,
        email: request.sender_id.email,
      },
      receiver: {
        id: request.receiver_id._id,
        name: request.receiver_id.name,
        email: request.receiver_id.email,
      },
      status: request.status,
      createdAt: request.created_at,
    }));

    res.status(200).json({
      message: "Pending friend requests retrieved successfully.",
      data: formattedRequests,
    });
  } catch (error) {
    console.error("Error retrieving pending friend requests:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const acceptRequest = async (req, res) => {
  const receiverId = req.userId;
  const { senderId } = req.params;

  if (!senderId) {
    return res.status(400).json({ message: "Sender ID is required." });
  }

  try {
    const request = await FriendModel.findOneAndUpdate(
      { sender_id: senderId, receiver_id: receiverId, status: "pending" },
      { status: "accepted", updated_at: new Date() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    }

    const senderRequest = await FriendModel.findOneAndUpdate(
      { sender_id: receiverId, receiver_id: senderId, status: "pending" },
      { status: "accepted", updated_at: new Date() },
      { new: true }
    );

    if (senderRequest) {
      await logRecentActivity(
        receiverId,
        "added friend",
        `You added a new friend.`,
        {
          friendId: senderId,
        }
      );
      await logRecentActivity(
        senderId,
        "added friend",
        `You added a new friend.`,
        { friendId: receiverId }
      );
    }

    res.status(200).json({ message: "Friend request accepted." });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const rejectRequest = async (req, res) => {
  const receiverId = req.userId;
  const { senderId } = req.params;

  if (!senderId) {
    return res.status(400).json({ message: "Sender ID is required." });
  }

  try {
    const request = await FriendModel.findOneAndUpdate(
      {
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      },
      { status: "rejected", updated_at: new Date() },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    }

    res.status(200).json({ message: "Friend request rejected." });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const getAllAcceptedFriends = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const acceptedFriends = await FriendModel.find({
      status: "accepted",
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .populate("sender_id", "name email")
      .populate("receiver_id", "name email");

    if (!acceptedFriends || acceptedFriends.length === 0) {
      return res.status(404).json({ message: "No accepted friends found." });
    }

    const friends = acceptedFriends.map((friendship) => {
      const friend =
        friendship.sender_id._id.toString() === userId
          ? friendship.receiver_id
          : friendship.sender_id;

      return {
        friendId: friend._id,
        name: friend.name,
        email: friend.email,
        addedAt: friendship.updated_at || friendship.created_at,
      };
    });

    // Return the list of friends
    return res.status(200).json({
      message: "Accepted friends retrieved successfully.",
      friends,
    });
  } catch (error) {
    console.error("Error retrieving accepted friends:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  getPendingRequests,
  sendRequest,
  acceptRequest,
  rejectRequest,
  getAllAcceptedFriends,
};
