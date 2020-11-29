const router = require('express').Router();

router.post('/create', (req, res) => {
  res.send('User creation dummy route');
});

router.post('/login', (req, res) => {
  res.send('User login dummy route');
});

module.exports = router;
