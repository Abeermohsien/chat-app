// src/components/Auth.js
import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';

function Auth({ setToken, setUser }) {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        const userData = { username, password };
        try {
            if (isRegister) {
                await registerUser(userData);
                alert('Registered successfully');
            } else {
                const { data } = await loginUser(userData);
                setToken(data.token);
                setUser({ username, _id: data.user._id });
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={handleSubmit}>{isRegister ? 'Register' : 'Login'}</button>
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Switch to Login' : 'Switch to Register'}
            </button>
        </div>
    );
}

export default Auth;
