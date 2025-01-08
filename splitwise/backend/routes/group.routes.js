const express = require("express");

const {
  createGroup,
  getAllGroupsCreatedbyUser,
  updateGroup,
  deleteGroup,
  getGroupById,
} = require("../controller/group.controller");
const { auth } = require("../middleware/auth");
const groupRouter = express.Router();

groupRouter.post("/create", auth, createGroup);
groupRouter.get("/get", auth, getAllGroupsCreatedbyUser);
groupRouter.put("/update/:groupId", auth, updateGroup);
groupRouter.delete("/delete/:groupId", auth, deleteGroup);
groupRouter.get("/getgroup/:groupId", auth, getGroupById);

module.exports = groupRouter;
