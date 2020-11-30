const { body } = require('express-validator');

const lengths = require('./lengths');

module.exports = [
  body('questionId').isMongoId(),
  body('content').isLength(lengths.answerContentLength),
  body('votes').not().exists()
];
