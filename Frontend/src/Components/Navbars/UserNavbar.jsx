import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLightningBolt, MdLogout, AiOutlinePlus, AiOutlineSetting } from '../../assets/Icons';


function UserNavbar() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = { id: newChatId, title: `Chat ${chats.length + 1}`, createdAt: new Date() };
    setChats((prev) => [...prev, newChat]);
    setActiveChat(newChatId);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear any session data if needed
      navigate('/');
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleNewChat}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <HiLightningBolt className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Threadwork</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="m-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
      >
        <AiOutlinePlus className="w-5 h-5" />
        New chat
      </button>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {chats.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No chats yet</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors text-sm truncate ${
                activeChat === chat.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              title={chat.title}
            >
              {chat.title}
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-gray-800 p-3 space-y-2">
        <button
          onClick={handleSettings}
          className="w-full p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3 text-sm"
        >
          <AiOutlineSetting className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3 text-sm"
        >
          <MdLogout className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserNavbar;
