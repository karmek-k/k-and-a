const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const throttle = require('express-throttle');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;
const isSwaggerAvailable = process.env.NODE_ENV !== 'production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require('./config/passport');
app.use(passport.initialize());
app.use(morgan('short'));
app.use(helmet());
app.use(cors());
app.use(throttle({ burst: 10, period: '1s' }));
app.use(cookieParser());
app.use(csurf({ cookie: true }));

// Mongoose
mongoose
  .connect(process.env.MONGODB_CONNECT_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error(err));

// Welcome route
if (isSwaggerAvailable) {
  app.get('/', (req, res) => {
    return res.json({
      msg: 'Welcome to the K&A API. See the docs below to get started.',
      docs: `http://localhost:${port}/api-docs`
    });
  });
}

// CSRF token route
app.get('/csrf-token', (req, res) => {
  return res.json({ csrfToken: req.csrfToken() });
});

// Other routes
app.use('/api/users', require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));

// Swagger UI
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'K&A API'
    }
  },
  apis: ['./routes/*.js']
};
const swaggerSpec = swaggerJsDoc(swaggerOptions);
if (isSwaggerAvailable) {
  // swagger ui is available only in development
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
