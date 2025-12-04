import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiLightningBolt } from '../assets/Icons';

function HomePage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages for current chat
  useEffect(() => {
    if (chatId) {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        const currentChat = chats.find(chat => chat.id === chatId);
        if (currentChat && currentChat.messages) {
          setMessages(currentChat.messages);
        } else {
          setMessages([]);
        }
      }
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Save messages whenever they change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const savedChats = localStorage.getItem('chats');
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        const chatIndex = chats.findIndex(chat => chat.id === chatId);
        if (chatIndex !== -1) {
          chats[chatIndex].messages = messages;
          // Update title with first message if it's still "New Chat"
          if (chats[chatIndex].title === 'New Chat' && messages.length > 0) {
            const firstMessage = messages.find(m => m.sender === 'user');
            if (firstMessage) {
              chats[chatIndex].title = firstMessage.text.substring(0, 30) + (firstMessage.text.length > 30 ? '...' : '');
            }
          }
          localStorage.setItem('chats', JSON.stringify(chats));
        }
      }
    }
  }, [messages, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { id: Date.now() + 1, text: data.response || 'No response', sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage = { id: Date.now() + 1, text: 'Error: Could not get response', sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      const botMessage = { id: Date.now() + 1, text: 'Network error. Please try again.', sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <HiLightningBolt className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Threadwork</h2>
              <p className="text-gray-600 max-w-md">Start a conversation or ask a question to get started</p>
            </div>
          ) : (
            // Messages
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default HomePage;