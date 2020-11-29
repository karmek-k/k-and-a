const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
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
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
