import React, { useState } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';

function App() {
    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);

    return (
        <div className="App">
            {token ? <Chat token={token} user={user} /> : <Auth setToken={setToken} setUser={setUser} />}
        </div>
    );
}

export default App;
