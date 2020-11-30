const { body } = require('express-validator');

const lengths = require('./lengths');

module.exports = [
  body('recipientId').isMongoId(),
  body('title').isLength(lengths.questionTitleLength),
  body('description').isLength(lengths.questionDescriptionLength)
];
