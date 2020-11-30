const router = require('express').Router();
const reportError = require('../functions/reportError');

const Question = require('../models/Question');

const auth = require('./middleware/authMiddleware');
const disallowBanned = require('./middleware/disallowBanned');
const validate = require('./middleware/validate');

const questionCreateValidators = require('../validation/questionCreate');
const User = require('../models/User');
const Answer = require('../models/Answer');

router.get('/latest', async (req, res) => {
  try {
    const questions = await Question.find().sort({ $natural: -1 }).limit(5);
    return res.json(questions);
  } catch (e) {
    reportError(e);
    res.status(500).send();
  }
});

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

router.post(
  '/create',
  auth,
  disallowBanned,
  questionCreateValidators,
  validate,
  async (req, res) => {
    const requestDto = {
      posterUsername: req.user.username,
      recipientUsername: req.body.recipientUsername,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags
    };

    // Check if the user is asking themselves
    if (requestDto.recipientUsername === req.user.username) {
      return res.status(400).json({
        msg: "You can't ask yourself"
      });
    }

    // Check if we're asking a non-existent user
    try {
      const recipient = await User.findOne({
        username: requestDto.recipientUsername
      });

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
