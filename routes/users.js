const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

const User = require('../models/User');
const userValidators = require('../validation/user');
const userLoginValidators = require('../validation/userLogin');
const reportError = require('../functions/reportError');
const auth = require('./authMiddleware');

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
    username: user.username
  });
});

router.post('/login', userLoginValidators, async (req, res) => {
  // Validate user data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  // Check if the user exists
  let user;
  try {
    user = await User.findOne({ username: req.body.username });
  } catch (e) {
    reportError(e);
    return res.status(500).send();
  }
  if (!user) {
    return res.status(404).send();
  }

  // check if the password matches
  try {
    if (!(await argon2.verify(user.password, req.body.password))) {
      return res.status(400).json({ msg: 'Invalid password' });
    }
  } catch (e) {
    reportError(e);
    return res.status(500).send();
  }

  // everything is good, send the JWT
  const payload = {
    username: user.username
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: '6h'
  });
  res.json({ token });
});

module.exports = router;
