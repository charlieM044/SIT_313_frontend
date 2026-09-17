const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRouter = require('./routes/authUsers');
const newsletterRouter = require('./routes/signupforEmail');
const postsRouter = require('./routes/post');
const viewpostsRouter = require('./routes/viewposts'); // Browse Posts: GET /api/viewposts


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

app.use('/api/posts', postsRouter);

app.use('/api', viewpostsRouter); // router defines GET /viewposts internally,
//  so this resolves to GET /api/viewposts






app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
