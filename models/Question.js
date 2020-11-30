const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  posterUsername: {
    type: String,
    required: true
  },
  recipientUsername: {
    type: String,
    required: true
  },
  answered: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Question', questionSchema);
