const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRouter = require('./routes/authUsers');
const newsletterRouter = require('./routes/signupforEmail');


const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('.'));

app.use('/api/auth', authRouter);
app.use('/', newsletterRouter);







app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
