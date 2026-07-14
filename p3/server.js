const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('.'));


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// POST /signup route
app.post('/signup', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                message: 'Invalid email address'
            });
        }

        // Send asynchronous email 
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to my newsletter!',
            html: `<h1>Thanks for signing up!</h1><p>Welcome to my newsletter, ${email}.</p>`
        });

        // Success response
        return res.status(201).json({
            message: 'Signed up successfully!',
            email: email
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: 'Server error, please try again later'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
