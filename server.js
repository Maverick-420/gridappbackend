require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const GridCell = require("./models/GridCell");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const io = new Server(server, {
  cors: {
    origin: "https://girdappfront.netlify.app",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "https://girdappfront.netlify.app",
  })
);

app.use(express.json());

app.get("/grid", async (req, res) => {
  const cells = await GridCell.find();
  res.json(cells);
});

app.post("/add", async (req, res) => {
  const { row, col, username, color } = req.body;
  const existingCell = await GridCell.findOne({ row, col });
  if (existingCell) {
    return res.status(400).json({ message: "Cell taken" });
  }
  const userCell = await GridCell.findOne({ username });
  if (userCell) {
    return res.status(400).json({ message: "Only one cell is allowed" });
  }
  const newCell = new GridCell({ row, col, username, color });
  await newCell.save();
  io.emit("addUser", { row, col, username, color });
  res.status(200).send();
});

app.post("/delete", async (req, res) => {
  const { username } = req.body;
  await GridCell.deleteOne({ username });
  const cells = await GridCell.find();
  io.emit("deleteUser", { username });
  res.status(200).send();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

io.on("connection", (socket) => {
  console.log("New client connected");
});
