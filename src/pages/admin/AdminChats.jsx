import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { FaPaperclip, FaPaperPlane, FaTimes, FaUserCircle } from 'react-icons/fa';

const AdminChats = () => {
  const { user } = useAuth();
  const { threads, messages, loading, error, listenToAllThreads, listenToMessages, sendMessage } = useChat();
  const [selectedThread, setSelectedThread] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = listenToAllThreads();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      const unsubscribe = listenToMessages(selectedThread.customerId, 'Admin');
      return () => unsubscribe();
    }
  }, [selectedThread]);

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
    if (!selectedThread || (!inputText.trim() && !selectedFile)) return;

    await sendMessage({
      customerId: selectedThread.customerId,
      customerName: selectedThread.customerName,
      senderId: user.uid,
      senderRole: 'Admin',
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

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl overflow-hidden shadow-lg border">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Customer Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No active chats</div>
          ) : (
            threads.map((thread) => (
              <div 
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 border-b cursor-pointer transition-colors flex items-center gap-3 ${
                  selectedThread?.id === thread.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <FaUserCircle className="text-gray-300 text-4xl" />
                  {thread.unreadAdminCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
                      {thread.unreadAdminCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-semibold truncate ${thread.unreadAdminCount > 0 ? 'text-black' : 'text-gray-700'}`}>
                      {thread.customerName}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(thread.lastMessageTime)}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${thread.unreadAdminCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
              <FaUserCircle className="text-gray-300 text-3xl" />
              <div>
                <h3 className="font-bold text-gray-800">{selectedThread.customerName}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Customer ID: {selectedThread.customerId}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
              {messages.map((msg, idx) => {
                const isMe = msg.senderRole === 'Admin';
                return (
                  <div key={idx} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm border-2 border-white">
                        {msg.customerName.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[70%] p-4 shadow-sm transition-all hover:shadow-md ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-[24px] rounded-br-[4px]' 
                        : 'bg-white text-gray-800 border rounded-[24px] rounded-bl-[4px] border-gray-200'
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
                      <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-gray-100">
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
                  title="Attach image"
                >
                  <FaPaperclip size={20} />
                </button>
                
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Write a reply..."
                  rows="1"
                  className="flex-1 bg-transparent border-none px-2 py-3 focus:outline-none focus:ring-0 text-[15px] text-gray-700 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
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
                    <FaPaperPlane size={20} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="bg-white p-10 rounded-full shadow-inner mb-6">
              <FaPaperPlane size={60} className="text-gray-100" />
            </div>
            <h3 className="text-xl font-medium text-gray-600">No Chat Selected</h3>
            <p className="mt-2">Select a customer from the left to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChats;
