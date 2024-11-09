require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const port = 6555;

app.use(bodyParser.json());

let users = require('./users.json');

const saveUsers = () => {
    fs.writeFileSync('./server/users.json', JSON.stringify(users, null, 2));
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    users.push({ username, email, password: hashedPassword, verified: false, verificationCode });
    saveUsers();

    // Send verification email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Your verification code is ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.send('User registered successfully, please verify your email.');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if (user && await bcrypt.compare(password, user.password)) {
        if (!user.verified) {
            return res.json({ success: false, message: 'Email not verified' });
        }

        const token = jwt.sign({ email: user.email }, 'secret', { expiresIn: '1h' });
        res.json({ success: true, token: token });
    } else {
        res.json({ success: false, message: 'Invalid email or password' });
    }
});

app.post('/verify', (req, res) => {
    const { code } = req.body;
    const user = users.find(user => user.verificationCode === code);

    if (user) {
        user.verified = true;
        saveUsers();
        res.send('Email verified successfully!');
    } else {
        res.send('Invalid verification code');
    }
});

app.post('/recover', (req, res) => {
    const { email } = req.body;
    const user = users.find(user => user.email === email);

    if (user) {
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = resetCode;
        saveUsers();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Recovery',
            text: `Your password reset code is ${resetCode}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.send('Password recovery email sent');
    } else {
        res.send('User not found');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
