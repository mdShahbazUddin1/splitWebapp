const crypto = require("crypto");
const nodemailer = require("nodemailer");
const InviteTokenModel = require("../model/invite.model");
const { UserModel } = require("../model/usermodel.model");
const GroupModel = require("../model/groupModel");
const logRecentActivity = require("../middleware/logActivities");

const sendInviteEmail = async (email, inviteLink) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "jackayron5@gmail.com",
      pass: "wdbpgwdcmarcrrrs",
    },
  });

  const mailOptions = {
    from: "jackayron5@gmail.com",
    to: email,
    subject: "Invitation Link",
    html: `
      <html>
        <head>
          <style>
            .container {
              background-color: #f2f2f2;
              text-align: center;
              padding: 20px;
              font-family: Arial, sans-serif;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .link {
              font-size: 18px;
              font-weight: bold;
              color: #007bff;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p>Hi,</p>
            <p>You have been invited to join a group. Click the link below to accept the invitation:</p>
            <a class="link" href="${inviteLink}" target="_blank">Accept Invitation</a>
            <p>This invitation link will expire in 24 hours.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const generateInviteToken = async (req, res) => {
  const userId = req.userId;
  try {
    const { groupId, recipientEmail } = req.body;

    if (!userId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "userId and recipientEmail are required.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const inviteToken = new InviteTokenModel({
      token,
      user_id: userId,
      group_id: groupId || null,
      recipient_email: recipientEmail,
      expires_at: expiresAt,
    });

    await inviteToken.save();

    const inviteLink = `http://localhost:4200/invite/${token}`;

    const emailSent = await sendInviteEmail(recipientEmail, inviteLink);

    if (!emailSent) {
      return res.status(503).json({
        success: false,
        message: "Failed to send the invite email.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invite link generated and sent successfully.",
      inviteLink,
    });
  } catch (error) {
    console.error("Error in generateInviteToken controller:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

const acceptInvite = async (req, res) => {
  const { token } = req.params;

  try {
    const inviteToken = await InviteTokenModel.findOne({ token });

    if (!inviteToken) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired invite token.",
      });
    }

    if (inviteToken.expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invite token has expired.",
      });
    }

    const user = await UserModel.findOne({
      email: inviteToken.recipient_email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with the provided email does not exist.",
      });
    }

    const group = await GroupModel.findById(inviteToken.group_id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    const isAlreadyMember = group.members.some(
      (member) => member.email === user.email
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the group.",
      });
    }

    group.members.push({
      name: user.name,
      email: user.email,
      added_by: inviteToken.user_id,
    });

    await group.save();

    await InviteTokenModel.deleteOne({ token });

    await logRecentActivity(
      user._id,
      "joined group",
      `You joined the group "${group.groupName}".`
    );

    return res.status(200).json({
      success: true,
      message: "User successfully added to the group.",
      group,
    });
  } catch (error) {
    console.error("Error in acceptInvite:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

module.exports = { generateInviteToken, acceptInvite };
