const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const router = require('express').Router();

const User = require('../models/User');
const userValidators = require('../validation/user');
const reportError = require('../functions/reportError');

router.post('/create', userValidators, async (req, res) => {
  // Validate user data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  // Check if the username is unique
  try {
    const userExists = await User.exists({
      username: req.body.username
    });
    if (userExists) {
      return res.status(409).json({ msg: 'This username already exists' });
    }
  } catch (e) {
    reportError(e);
    return res.status(500).send();
  }

  // Hash the password
  let hashedPass;
  try {
    hashedPass = await argon2.hash(req.body.password);
  } catch (e) {
    reportError(e);
    return res.status(500).send();
  }

  // Create the user
  const user = new User({
    username: req.body.username,
    password: hashedPass,
    email: req.body.email
  });
  try {
    await user.save();
  } catch (e) {
    reportError(e);
    return res.status(500).send();
  }

  // Send response
  return res.status(201).json({
    id: user._id,
    username: user.username
  });
});

router.post('/login', async (req, res) => {
  res.send('User login dummy route');
});

module.exports = router;
