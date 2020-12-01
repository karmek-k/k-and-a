const router = require('express').Router();
const mongoose = require('mongoose');

const auth = require('./middleware/authMiddleware');
const disallowBanned = require('./middleware/disallowBanned');
const validate = require('./middleware/validate');
const answerCreateValidators = require('../validation/answerCreate');

const Answer = require('../models/Answer');
const Question = require('../models/Question');

const reportError = require('../functions/reportError');

/**
 * @swagger
 *
 * /api/answers/create:
 *   post:
 *     summary: Creates a new answer.
 *     tags:
 *       - answers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 example: 5fc522b832b2db1dbc3716f4
 *               content:
 *                 type: string
 *     responses:
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: The poster has been banned
 *       '400':
 *         description: Validation failed / The user tried to answer themselves
 *       '409':
 *         description: The question has been already answered
 *       '201':
 *         description: Answer was created successfully
 */
router.post(
  '/create',
  auth,
  disallowBanned,
  answerCreateValidators,
  validate,
  async (req, res) => {
    const answerCreateDto = {
      posterId: req.user.id,
      questionId: req.body.questionId,
      content: req.body.content
    };

    // Check if the user is answering themselves
    const questionOpId = (await Question.findById(answerCreateDto.questionId))
      .posterId;

    if (req.user.id == questionOpId) {
      // req.user.id: string, questionOpId: object
      return res
        .status(400)
        .json({ msg: "You can't answer your own question" });
    }

    // Try to save the answer
    const answer = new Answer(answerCreateDto);

    try {
      await answer.save();
    } catch (e) {
      return res
        .status(409)
        .json({ msg: 'This question has already been answered' });
    }

    return res.status(201).json(answer);
  }
);

/**
 * @swagger
 *
 * /api/answers/upvote/{id}:
 *   post:
 *     summary: Upvotes an answer.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Answer id
 *     tags:
 *       - answers
 *     responses:
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: >
 *           The user has been banned /
 *           The user has already upvoted this question
 *       '400':
 *         description: Invalid question id / Trying to upvote your own answer
 *       '404':
 *         description: Question not found
 *       '200':
 *         description: Upvoted
 */
router.post('/upvote/:id', auth, disallowBanned, async (req, res) => {
  const upvoterId = req.user.id;

  // Check if the id is correct
  let answer;
  try {
    answer = await Answer.findById(req.params.id);
  } catch (e) {
    return res.status(400).json({ msg: 'Invalid question id' });
  }

  // Check if the answer exists
  if (!answer) {
    return res.status(404).json({ msg: 'Answer not found' });
  }

  // Check if the user has already upvoted this answer
  const upvoters = answer.upvotersIds;
  if (upvoters.find(id => id == upvoterId)) {
    return res
      .status(403)
      .json({ msg: 'You have already upvoted this answer' });
  }

  // Check if the user is upvoting themselves
  if (answer.posterId === upvoterId) {
    return res.status(400).json({ msg: "You can't upvote your own answer" });
  }

  upvoters.push(new mongoose.Types.ObjectId(upvoterId));
  try {
    await answer.updateOne({ upvotersIds: upvoters });
  } catch (e) {
    reportError(e);
    return res.status(500).send();
  }

  return res.json({ answer });
});

module.exports = router;
