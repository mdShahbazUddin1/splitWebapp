const express = require("express");
const cors = require("cors");
const connection = require("./config/DB");
const { userRouter } = require("./routes/user.routes");
const session = require("express-session");
const groupRouter = require("./routes/group.routes");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const expenseRoute = require("./routes/expense.routes");
const friendRouter = require("./routes/friend.routes");
const recentRouter = require("./routes/recent.routes");
const inviteRoute = require("./routes/invites.routes");
const settleRoute = require("./routes/settle.routes");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

app.use(
  session({
    secret: "seesionkdfjnsvaadskkdsa",
    resave: false,
    saveUninitialized: false,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.use("/auth", userRouter);
app.use("/group", groupRouter);
app.use("/expense", expenseRoute);
app.use("/friend", friendRouter);
app.use("/recent", recentRouter);
app.use("/invite", inviteRoute);
app.use("/settle", settleRoute);

// Cloudinary File Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
  const formData = new FormData();
  formData.append("file", req.file.buffer, req.file.originalname);
  formData.append("upload_preset", "my_influencer");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/ddyowxrg3/image/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    res.status(200).json({ msg: "Image Uploaded", response: response.data });
  } catch (error) {
    res.status(500).json({ msg: "Image upload failed", error: error.message });
  }
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log(`Message from ${socket.id}:`, msg);
    socket.emit("message", `Server received: ${msg}`);
    socket.broadcast.emit("message", `New message from ${socket.id}: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, async () => {
  try {
    await connection;
    console.log("✅ DB Connected");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error);
  }
  console.log(`🚀 Server running on port ${PORT}`);
});
