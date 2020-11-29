const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Mongoose
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Welcome route
app.get('/', (req, res) => {
  return res.json({
    msg: 'Welcome to the K&A API. See the docs below to get started.',
    docs: 'https://github.com/karmek-k/k-and-a'
  });
});

// Other routes
app.use('/api/users', require('./routes/users'));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
