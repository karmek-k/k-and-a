const router = require('express').Router();

const auth = require('./middleware/authMiddleware');
const disallowBanned = require('./middleware/disallowBanned');
const validate = require('./middleware/validate');
const answerCreateValidators = require('../validation/answerCreate');

const Answer = require('../models/Answer');

router.post(
  '/create',
  auth,
  disallowBanned,
  answerCreateValidators,
  validate,
  async (req, res) => {
    const answerCreateDto = {
      posterId: req.user._id,
      questionId: req.body.questionId,
      content: req.body.content
    };

    const answer = new Answer(answerCreateDto);

    try {
      await answer.save();
    } catch (e) {
      console.error(e);
    }

    return res.status(201).json(answer);
  }
);

module.exports = router;
