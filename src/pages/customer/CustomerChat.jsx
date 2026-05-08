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
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.map((msg, idx) => {
          const isMe = msg.senderRole === 'Customer';
          return (
            <div key={idx} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm border border-white">
                  {msg.senderRole.charAt(0)}
                </div>
              )}
              <div className={`max-w-[75%] p-4 shadow-sm transition-all hover:shadow-md ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-[24px] rounded-br-[4px]' 
                  : 'bg-gray-100 text-gray-800 rounded-[24px] rounded-bl-[4px] border border-gray-200'
              }`}>
                {msg.attachmentUrl && (
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/20">
                    <img 
                      src={msg.attachmentUrl} 
                      alt="attachment" 
                      className="max-w-full h-auto cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(msg.attachmentUrl, '_blank')}
                    />
                  </div>
                )}
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className={`text-[10px] mt-2 flex justify-end items-center gap-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
              {isMe && (
                <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-white shadow-sm"></div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-xs text-center border-t border-red-100">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-6 border-t border-gray-100">
        {filePreview && (
          <div className="relative inline-block mb-4">
            <img src={filePreview} alt="preview" className="h-24 w-24 object-cover rounded-2xl border-2 border-blue-50 shadow-lg" />
            <button 
              onClick={() => { setSelectedFile(null); setFilePreview(null); }}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 transition-all hover:scale-110"
            >
              <FaTimes size={12} />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-200 shadow-inner">
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
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <FaPaperclip size={20} />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none px-2 py-3 focus:outline-none focus:ring-0 text-[15px] text-gray-700"
          />
          
          <button 
            type="submit"
            disabled={loading || (!inputText.trim() && !selectedFile)}
            className={`p-4 bg-blue-600 text-white rounded-full transition-all flex items-center justify-center shadow-lg ${
              loading || (!inputText.trim() && !selectedFile) 
                ? 'opacity-40 cursor-not-allowed grayscale' 
                : 'hover:bg-blue-700 hover:shadow-blue-200 active:scale-95'
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
