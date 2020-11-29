const { body } = require('express-validator');

const lengths = require('./lengths');

module.exports = [
  body('recipientUsername').exists(),
  body('title').isLength(lengths.questionTitleLength),
  body('description').isLength(lengths.questionDescriptionLength)
];
