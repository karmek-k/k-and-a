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
  posterId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  recipientId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  tags: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Question', questionSchema);
