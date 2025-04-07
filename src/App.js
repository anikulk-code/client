import React, { useEffect, useState } from 'react';
import { getUserInfo, sendChatMessage, uploadFile, listFiles, deleteFile } from './utils/api';


function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const maxFiles = 3;

  useEffect(() => {
    getUserInfo().then(setUser).catch(console.error);
    listFiles().then(setUploadedFiles);
  }, []);

  // const loadFiles = async () => {
  //   const files = await listFiles();
  //   setUploadedFiles(files.map(name => ({
  //     name,
  //     url: `https://<your-storage-account>.blob.core.windows.net/uploads/${name}`
  //   })));
  // };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);

    const lastThreeMessages = updatedMessages.slice(-3).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const apiData = await sendChatMessage(lastThreeMessages);
    const botReply = apiData?.reply || `Echo: ${input}`;
    const botMessage = { sender: 'bot', text: botReply };

    setChatMessages(prev => [...prev, botMessage]);
    setInput('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (uploadedFiles.length >= maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      if (e.target) e.target.value = null;
      return;
    }

    const data = await uploadFile(file);
    if (data?.url) {
      listFiles().then(setUploadedFiles);
    } else {
      alert('File upload failed');
    }

    if (e.target) {
      e.target.value = null;
    }
  };

  const handleDeleteFile = async (filename) => {
    const success = await deleteFile(filename);
    if (success) {
      listFiles().then(setUploadedFiles);
    } else {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Chat App</h1>

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

      {/* Uploaded File List */}
      <div style={{ marginBottom: '15px' }}>
        <h4>Uploaded Files ({uploadedFiles.length}/3)</h4>
        {uploadedFiles.map(file => (
          <div key={file.name} style={{ display: 'flex', alignItems: 'center' }}>
            <a href={file.url} target="_blank" rel="noreferrer">{file.name}</a>
            <button
              onClick={() => handleDeleteFile(file.name)}
              style={{
                marginLeft: '10px',
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        ))}

        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploadedFiles.length >= maxFiles}
          style={{ marginTop: '10px' }}
        />
      </div>

      {/* Chat Messages */}
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

      {/* Chat Input */}
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
