import React, { useEffect, useState } from 'react';
import { getUserInfo, sendChatMessage } from './utils/api';


function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);


  useEffect(() => {
    getUserInfo().then(setUser).catch(console.error);
  }, []);

  // Handle sending the chat message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user's message to chat state
    const userMessage = { sender: 'user', text: input };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);

    // Prepare the last three messages (including this new one) for API
    const lastThreeMessages = updatedMessages.slice(-3).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Send chat messages to API
    const apiData = await sendChatMessage(lastThreeMessages);
    const botReply = apiData?.reply || `Echo: ${input}`;
    const botMessage = { sender: 'bot', text: botReply };

    // Add bot response to chat
    setChatMessages(prev => [...prev, botMessage]);
    setInput('');
  };


  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Chat App</h1>
      {/* User Info Section */}
      {user ? (
        <div style={{ marginBottom: '10px' }}>
          👋 Welcome, <strong>{user.userDetails}</strong>!
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="/.auth/logout">Logout</a>
        </div>
      ) : (
        <div style={{ marginBottom: '10px' }}>
          <a href="/.auth/login/github">Login with GitHub</a>
        </div>
      )}
      {/* Chat Messages Section */}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '300px',
          overflowY: 'scroll',
          marginBottom: '10px'
        }}
      >
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '10px 0'
            }}
          >
            <span
              style={{
                background: msg.sender === 'user' ? '#DCF8C6' : '#F1F0F0',
                padding: '8px 12px',
                borderRadius: '15px',
                display: 'inline-block'
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: '1',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '4px',
            border: 'none',
            background: '#0078D4',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
