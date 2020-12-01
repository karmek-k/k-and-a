const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

const User = require('../models/User');
const userValidators = require('../validation/user');
const userLoginValidators = require('../validation/userLogin');
const reportError = require('../functions/reportError');
const validate = require('./middleware/validate');

/**
 * @swagger
 *
 * /api/users/create:
 *   post:
 *     summary: Creates a new user.
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user
 *               password:
 *                 type: string
 *                 example: p4ssw0rd
 *               email:
 *                 type: string
 *                 example: 'user@example.com'
 *     responses:
 *       '201':
 *         description: Created
 *       '409':
 *         description: This username has been taken
 *       '400':
 *         description: Validation failed
 */
router.post('/create', userValidators, validate, async (req, res) => {
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
    return res.status(409).json({ msg: 'This username already exists' });
  }

  // Send response
  return res.status(201).json({
    username: user.username,
    id: user._id
  });
});

/**
 * @swagger
 *
 * /api/users/login:
 *   post:
 *     summary: Returns a JWT for the specified user.
 *     tags:
 *       - users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user
 *               password:
 *                 type: string
 *                 example: p4ssw0rd
 *     responses:
 *       '200':
 *         description: Token returned to the user
 *       '404':
 *         description: No such user found
 *       '400':
 *         description: Validation failed
 */
router.post('/login', userLoginValidators, validate, async (req, res) => {
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
    username: user.username,
    id: user._id
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: '6h'
  });
  res.json({ token });
});

module.exports = router;
