const router = require('express').Router();
const reportError = require('../functions/reportError');

const Question = require('../models/Question');

const auth = require('./middleware/authMiddleware');
const disallowBanned = require('./middleware/disallowBanned');
const validate = require('./middleware/validate');

const questionCreateValidators = require('../validation/questionCreate');
const User = require('../models/User');
const Answer = require('../models/Answer');

/**
 * @swagger
 *
 * /api/questions/latest:
 *   get:
 *     summary: Fetches the most recent five questions.
 *     tags:
 *       - questions
 *     responses:
 *       '200':
 *         description: Questions have been returned
 */
router.get('/latest', async (req, res) => {
  try {
    const questions = await Question.find().sort({ $natural: -1 }).limit(5);
    return res.json(questions);
  } catch (e) {
    reportError(e);
    res.status(500).send();
  }
});

/**
 * @swagger
 *
 * /api/questions/{id}:
 *   get:
 *     summary: Returns details for a question and its answer (if exists).
 *     tags:
 *       - questions
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Question id
 *     responses:
 *       '400':
 *         description: Invalid question id
 *       '404':
 *         description: Question not found
 *       '200':
 *         description: Question and answer returned
 */
router.get('/:id', async (req, res) => {
  let question;
  try {
    question = await Question.findById(req.params.id);
  } catch (e) {
    return res.status(400).json({ msg: 'Invalid question id' });
  }

  if (question) {
    let answer = null;
    answer = await Answer.findOne({ questionId: question._id });

    return res.json({ question, answer });
  }

  return res.status(404).json({ msg: 'Question not found' });
});

/**
 * @swagger
 *
 * /api/questions/create:
 *   post:
 *     summary: Creates a new question.
 *     tags:
 *       - questions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: test question
 *               recipientId:
 *                 type: string
 *                 example: 5fc5229f32b2db1dbc3716f3
 *               description:
 *                 type: string
 *                 required: false
 *               tags:
 *                 type: array
 *                 example: ["intro", "hello"]
 *
 *     responses:
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: The poster has been banned
 *       '400':
 *         description: Validation failed / The user tried to ask themselves
 *       '404':
 *         description: The recipient does not exist
 *       '201':
 *         description: Question was created successfully
 */
router.post(
  '/create',
  auth,
  disallowBanned,
  questionCreateValidators,
  validate,
  async (req, res) => {
    const requestDto = {
      posterId: req.user.id,
      recipientId: req.body.recipientId,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags
    };

    // Check if the user is asking themselves
    if (requestDto.recipientId === req.user.id) {
      return res.status(400).json({
        msg: "You can't ask yourself"
      });
    }

    // Check if we're asking a non-existent user
    try {
      const recipient = await User.findById(requestDto.recipientId);

      if (!recipient) {
        return res.status(404).json({ msg: 'The recipient does not exist' });
      }
    } catch (e) {
      reportError(e);
      return res.status(500).send();
    }

    const question = new Question(requestDto);

    try {
      question.save();
    } catch (e) {
      reportError(e);
      return res.status(500).send();
    }

    return res.status(201).json(question);
  }
);

module.exports = router;
