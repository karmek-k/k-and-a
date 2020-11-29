module.exports = (req, res, next) => {
  if (req.user.isBanned) {
    return res.status(403).json({ msg: 'You are banned!' });
  }
  next();
};
