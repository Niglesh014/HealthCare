const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Doctor", doctorSchema);