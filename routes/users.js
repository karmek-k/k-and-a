const router = require('express').Router();

router.post('/create', async (req, res) => {
  res.send('User creation dummy route');
});

router.post('/login', async (req, res) => {
  res.send('User login dummy route');
});

module.exports = router;
