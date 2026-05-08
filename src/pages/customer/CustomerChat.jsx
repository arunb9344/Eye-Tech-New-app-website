import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { FaPaperclip, FaPaperPlane, FaTimes } from 'react-icons/fa';

const CustomerChat = () => {
  const { user } = useAuth();
  const { messages, loading, error, listenToMessages, sendMessage } = useChat();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToMessages(user.uid, 'Customer');
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    await sendMessage({
      customerId: user.uid,
      customerName: user.displayName || user.email,
      senderId: user.uid,
      senderRole: 'Customer',
      text: inputText,
      file: selectedFile
    });

    setInputText('');
    setSelectedFile(null);
    setFilePreview(null);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50 rounded-xl overflow-hidden shadow-sm border">
      {/* Header */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Support Chat</h2>
          <p className="text-sm text-gray-500">We usually respond within a few hours</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.senderRole === 'Customer';
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-3 ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border rounded-tl-none shadow-sm'
              }`}>
                {msg.attachmentUrl && (
                  <img 
                    src={msg.attachmentUrl} 
                    alt="attachment" 
                    className="rounded-lg mb-2 max-w-full h-auto cursor-pointer hover:opacity-90"
                    onClick={() => window.open(msg.attachmentUrl, '_blank')}
                  />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-xs text-center border-t">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-4 border-t">
        {filePreview && (
          <div className="relative inline-block mb-2">
            <img src={filePreview} alt="preview" className="h-20 w-20 object-cover rounded-lg border" />
            <button 
              onClick={() => { setSelectedFile(null); setFilePreview(null); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <FaTimes size={10} />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaPaperclip size={20} />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          
          <button 
            type="submit"
            disabled={loading || (!inputText.trim() && !selectedFile)}
            className={`p-3 bg-blue-600 text-white rounded-full transition-all ${
              loading || (!inputText.trim() && !selectedFile) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 shadow-md hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerChat;
