import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Thêm tin nhắn của người dùng
    const userMessage = {
      text: newMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Phản hồi tự động sau 1 giây
    setTimeout(() => {
      const botMessage = {
        text: "Cảm ơn tin nhắn của bạn. Nhân viên sẽ phản hồi sớm nhất có thể.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="chatbot-container">
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : '💬'}
      </button>

      <div className={`chatbot-content ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <h3>Chat với chúng tôi</h3>
        </div>

        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.isUser ? 'user' : 'bot'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chatbot-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
          />
          <button type="submit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot; 