const { body } = require('express-validator');

module.exports = [
  body('username').isLength({ min: 3, max: 20 }).isAlphanumeric(),
  body('password').isLength({ min: 6, max: 64 }),
  body('email').isEmail()
];
