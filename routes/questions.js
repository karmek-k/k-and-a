const router = require('express').Router();
const reportError = require('../functions/reportError');

const Question = require('../models/Question');

router.get('/latest', async (req, res) => {
  try {
    const questions = await Question.find().sort({ $natural: -1 }).limit(5);
    return res.json(questions);
  } catch (e) {
    reportError(e);
    res.status(500).send();
  }
});

module.exports = router;
