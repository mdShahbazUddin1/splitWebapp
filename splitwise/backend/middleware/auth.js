const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/usermodel.model");
const { BlackListModel } = require("../model/blacklist");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      //   console.log("Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);

      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return res
          .status(403)
          .send({ message: "Invalid token: User not found" });
      }

      const blackListedToken = await BlackListModel.findOne({ token });
      if (blackListedToken) {
        return res
          .status(401)
          .send({ message: "Login required: Token is invalid" });
      }

      req.user = user;
      req.userId = decoded.userId;
      req.email = decoded.email;
      // console.log(req.email);
      next();
    } else {
      res.status(401).json({ error: "Unauthorized: Token missing or invalid" });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(500).send({ error: error.message });
  }
};

module.exports = { auth };
