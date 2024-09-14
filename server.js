// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const WebSocketServer = require('websocket').server;
require('dotenv').config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error(err));

// User Authentication (Registration and Login)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword });
    try {
        await user.save();
        res.send('User registered');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Username or password is wrong');

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send({ token });
});

// Store Chat Messages
app.post('/api/messages', async (req, res) => {
    const { sender, content } = req.body;
    const message = new Message({ sender, content });
    try {
        await message.save();
        res.send('Message saved');
    } catch (err) {
        res.status(400).send('Error saving message');
    }
});

// WebSocket Setup
const server = app.listen(3000, () => console.log('Server running on port 3000'));

const wsServer = new WebSocketServer({ httpServer: server });

let clients = [];

wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);
    clients.push(connection);

    connection.on('message', async function (message) {
        const data = JSON.parse(message.utf8Data);
        // Broadcast the message to all connected clients
        clients.forEach(client => client.sendUTF(message.utf8Data));
        // Save message to the database
        const savedMessage = new Message({
            sender: data.sender,
            content: data.content
        });
        await savedMessage.save();
    });

    connection.on('close', function (connection) {
        clients = clients.filter(client => client !== connection);
    });
});
