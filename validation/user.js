const { body } = require('express-validator');

const lengths = require('./lengths');

module.exports = [
  body('username').isLength(lengths.usernameLength).isAlphanumeric(),
  body('password').isLength(lengths.passwordLength),
  body('email').isEmail()
];
