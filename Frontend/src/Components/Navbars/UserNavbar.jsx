import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiLightningBolt, MdLogout, AiOutlinePlus, AiOutlineSetting } from '../../assets/Icons';
import { AiOutlineEdit, AiOutlineDelete, AiOutlineMenuFold, AiOutlineMenuUnfold } from 'react-icons/ai';
import ConfirmDialog from '../ConfirmDialog';


function UserNavbar({ isOpen = true, onToggle }) {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, chatId: null });

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = { 
      id: newChatId, 
      title: `New Chat`, 
      createdAt: new Date().toISOString(),
      messages: []
    };
    setChats((prev) => [newChat, ...prev]);
    navigate(`/chat/${newChatId}`);
  };

  const handleRenameChat = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (chatId) => {
    if (editTitle.trim()) {
      setChats((prev) => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
        )
      );
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDeleteChat = (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, type: 'delete', chatId });
  };

  const confirmDeleteChat = () => {
    const { chatId: deleteChatId } = confirmDialog;
    setChats((prev) => prev.filter(chat => chat.id !== deleteChatId));
    
    // If deleting current chat, navigate to home
    if (deleteChatId === chatId) {
      navigate('/home');
    }
    setConfirmDialog({ isOpen: false, type: null, chatId: null });
  };

  const handleLogout = () => {
    setConfirmDialog({ isOpen: true, type: 'logout', chatId: null });
  };

  const confirmLogout = () => {
    // Clear any session data if needed
    navigate('/');
    setConfirmDialog({ isOpen: false, type: null, chatId: null });
  };

  const handleConfirm = () => {
    if (confirmDialog.type === 'delete') {
      confirmDeleteChat();
    } else if (confirmDialog.type === 'logout') {
      confirmLogout();
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ isOpen: false, type: null, chatId: null });
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <>
      <div className={`bg-gray-900 text-white flex flex-col h-screen transition-all duration-300 relative ${
        isOpen ? 'w-76' : 'w-16'
      } overflow-visible`}>
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          title={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? <AiOutlineMenuFold className="w-5 h-5" /> : <AiOutlineMenuUnfold className="w-5 h-5" />}
        </button>

      {/* Logo */}
      <div className={`p-4 border-b border-gray-800 ${isOpen ? '' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleNewChat}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <HiLightningBolt className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold whitespace-nowrap">Threadwork</span>
          </div>
        </div>

      {/* New Chat Button */}
      {isOpen && (
        <button
          onClick={handleNewChat}
          className="m-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
        >
          <AiOutlinePlus className="w-5 h-5" />
          New chat
        </button>
      )}

      {/* Chat History */}
      <div className={`flex-1 overflow-y-auto px-3 py-4 space-y-2 ${isOpen ? '' : 'opacity-0'}`}>
        {chats.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No chats yet</p>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="group relative">
              {editingChatId === chat.id ? (
                // Edit mode
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(chat.id);
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    className="flex-1 px-2 py-1 bg-gray-700 text-white text-sm rounded outline-none border border-gray-600 focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveRename(chat.id)}
                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelRename}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // View mode
                <Link
                  to={`/chat/${chat.id}`}
                  className={`block p-3 rounded-lg cursor-pointer transition-colors text-sm truncate ${
                    chatId === chat.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  title={chat.title}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate flex-1">{chat.title}</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRenameChat(chat.id, chat.title);
                        }}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Rename"
                      >
                        <AiOutlineEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <AiOutlineDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      {isOpen && (
        <div className="border-t border-gray-800 p-3 space-y-2">
          <button
            onClick={handleSettings}
            className="w-full p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3 text-sm"
          >
            <AiOutlineSetting className="w-5 h-5" />
            <span className="whitespace-nowrap">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3 text-sm"
          >
            <MdLogout className="w-5 h-5" />
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>
      )}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'delete' ? 'Delete Chat' : 'Logout'}
        message={confirmDialog.type === 'delete' 
          ? 'Are you sure you want to delete this chat? This action cannot be undone.' 
          : 'Are you sure you want to logout?'}
        onConfirm={handleConfirm}
        onCancel={handleCancelDialog}
      />
    </>
  );
}

export default UserNavbar;
