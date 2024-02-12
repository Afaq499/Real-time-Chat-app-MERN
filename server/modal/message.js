const mongoose = require('mongoose');

// Define message schema
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a Message model based on the schema
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
