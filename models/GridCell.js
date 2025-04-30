const mongoose = require("mongoose");

const grid = new mongoose.Schema({
  row: Number,
  col: Number,
  username: String,
  color: String,
});

module.exports = mongoose.model("GridCell", grid);
