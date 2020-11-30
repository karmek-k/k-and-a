const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  posterId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  questionId: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: { unique: true }
  },
  content: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Answer', answerSchema);
