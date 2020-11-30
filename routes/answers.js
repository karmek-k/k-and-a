const router = require('express').Router();

const auth = require('./middleware/authMiddleware');
const disallowBanned = require('./middleware/disallowBanned');
const validate = require('./middleware/validate');
const answerCreateValidators = require('../validation/answerCreate');

const Answer = require('../models/Answer');
const Question = require('../models/Question');

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

module.exports = router;
