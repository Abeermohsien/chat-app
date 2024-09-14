const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const WebSocketServer = require('websocket').server;
const dotenv = require('dotenv');
const User = require('./models/User');
const Message = require('./models/Message');
dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error(err));

// User Registration
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

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid username or password');

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

// WebSocket
const server = app.listen(3000, () => console.log('Server running on port 3000'));

const wsServer = new WebSocketServer({ httpServer: server });
let clients = [];

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);
    clients.push(connection);

    connection.on('message', async (message) => {
        const data = JSON.parse(message.utf8Data);
        clients.forEach(client => client.sendUTF(message.utf8Data));

        const newMessage = new Message({ sender: data.sender, content: data.content });
        await newMessage.save();
    });

    connection.on('close', () => {
        clients = clients.filter(client => client !== connection);
    });
});

