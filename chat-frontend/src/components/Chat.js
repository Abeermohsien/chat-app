// src/components/Chat.js
import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
const client = new W3CWebSocket('ws://localhost:3000');

function Chat({ token, user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        client.onmessage = (message) => {
            const data = JSON.parse(message.data);
            setMessages((prev) => [...prev, data]);
        };
    }, []);

    const sendMessage = () => {
        client.send(JSON.stringify({
            sender: user._id,
            content: input
        }));
        setInput('');
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.sender}</strong>: {msg.content}
                    </div>
                ))}
            </div>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;
