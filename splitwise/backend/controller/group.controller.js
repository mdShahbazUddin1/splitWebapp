const logRecentActivity = require("../middleware/logActivities");
const GroupModel = require("../model/groupModel");
const { UserModel } = require("../model/usermodel.model");

const createGroup = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupName, members, groupImage, groupType } = req.body;

    if (!groupName || !members || members.length === 0) {
      return res
        .status(400)
        .send({ msg: "GroupName and Members are required." });
    }

    // Validate members and ensure they exist in the User collection
    const membersWithUserIds = await Promise.all(
      members.map(async (member) => {
        const user = await UserModel.findOne({ email: member.email });
        if (!user) {
          throw new Error(`User with email ${member.email} does not exist.`);
        }

        return {
          name: user.name,
          email: user.email,
          user_id: user._id, // Reference the user's ID
          added_by: userId, // Reference the ID of the user creating the group
          added_at: Date.now(),
        };
      })
    );

    // Create the new group
    const newGroup = new GroupModel({
      groupName,
      members: membersWithUserIds,
      groupImage,
      groupType,
      created_by: userId,
    });

    // Save the group
    await newGroup.save();

    // Log activity for the group creator
    await logRecentActivity(
      userId,
      "created group",
      `You created the group "${groupName}".`
    );

    res
      .status(200)
      .send({ msg: "Group created successfully.", group: newGroup });
  } catch (error) {
    if (error.message.startsWith("User with email")) {
      // Handle specific error for missing users
      return res.status(400).send({ msg: error.message });
    }
    res.status(503).send({ msg: error.message });
  }
};

const getAllGroupsCreatedbyUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) return res.status(400).send({ msg: "UserId is required" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send({ msg: "User not found" });

    const userEmail = user.email;

    const groups = await GroupModel.find({
      $or: [{ created_by: userId }, { "members.email": userEmail }],
    });

    if (groups.length === 0)
      return res.status(200).send({ msg: "No groups found!" });

    const groupsWithMemberInfo = groups.map((group) => {
      const isUserCreator = group.created_by.toString() === userId.toString();

      const userMemberInfo = group.members.find(
        (member) => member.email === userEmail
      );

      const membersWithAddedBy = group.members.map((member) => {
        return {
          ...member,
          addedByUser: member.added_by || "Not Available",
        };
      });

      return {
        ...group.toObject(),
        isUserCreator,
        userMemberInfo,
        members: membersWithAddedBy,
      };
    });

    // Return the groups with necessary info
    res.status(200).send({ msg: "All Groups", groups: groupsWithMemberInfo });
  } catch (error) {
    res.status(503).send({ msg: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) return res.status(401).send({ msg: "Group ID is required" });

    const getGroup = await GroupModel.findById({ _id: groupId });

    if (!getGroup) return res.status(401).send({ msg: "No Groups Found" });

    res
      .status(200)
      .send({ msg: "Group Successfully fetched", group: getGroup });
  } catch (error) {
    res.status(503).send({ msg: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupId } = req.params;
    const { groupName, membersToAdd, membersToRemove } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required." });
    }

    // Find the group
    const group = await GroupModel.findOne({
      _id: groupId,
      created_by: userId,
    });

    if (!group) {
      return res.status(403).json({
        message:
          "You are not authorized to update this group, or it doesn't exist.",
      });
    }

    // Update the group name if provided
    if (groupName) {
      group.groupName = groupName;
    }

    // Add members
    if (membersToAdd && membersToAdd.length > 0) {
      for (const member of membersToAdd) {
        const user = await UserModel.findOne({ email: member.email });
        if (!user) {
          return res.status(404).json({
            message: `User with email ${member.email} does not exist.`,
          });
        }

        // Check if the member already exists in the group
        const isMemberAlreadyAdded = group.members.some(
          (m) => m.user_id.toString() === user._id.toString()
        );

        if (!isMemberAlreadyAdded) {
          group.members.push({
            name: member.name || user.name,
            email: member.email,
            user_id: user._id,
            added_by: userId, // ID of the user adding the member
          });
        }
      }
    }

    // Remove members
    if (membersToRemove && membersToRemove.length > 0) {
      group.members = group.members.filter(
        (member) => !membersToRemove.includes(member.user_id.toString())
      );
    }

    // Update timestamps
    group.updated_at = Date.now();

    // Save the updated group
    const updatedGroup = await group.save();

    res.status(200).json({
      message: "Group updated successfully.",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const userId = req.userId;
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required." });
    }

    const group = await GroupModel.findOneAndDelete({
      _id: groupId,
      created_by: userId,
    });

    if (!group) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this group, or it doesn't exist.",
      });
    }

    res.status(200).json({
      message: "Group deleted successfully.",
      group,
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  createGroup,
  getAllGroupsCreatedbyUser,
  updateGroup,
  deleteGroup,
  getGroupById,
};
