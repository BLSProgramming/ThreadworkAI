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
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user-specific storage key
  const getChatStorageKey = () => {
    const userId = localStorage.getItem('current_user_id');
    return userId ? `chats_user_${userId}` : 'chats';
  };

  // Fetch chats from backend
  const fetchChatsFromBackend = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chats) {
          console.log('[UserNavbar] Backend chats:', data.chats);
          // Transform backend chats to match frontend format
          // Backend returns tuples [id, user_message, model_response, created_at]
          const formattedChats = data.chats.map((chat, index) => {
            const chatId = Array.isArray(chat) ? chat[0] : chat.id;
            const userMsg = Array.isArray(chat) ? chat[1] : chat.user_message;
            const modelResp = Array.isArray(chat) ? chat[2] : chat.model_response;
            const createdAt = Array.isArray(chat) ? chat[3] : chat.created_at;
            
            console.log('[UserNavbar] Transforming chat:', { chatId, hasResponse: !!modelResp });
            return {
              id: `chat-${chatId}`,
              title: userMsg?.substring(0, 30) || 'Chat',
              createdAt: createdAt,
              messages: [
                { id: chatId * 2, text: userMsg || 'User message', sender: 'user' },
                { id: chatId * 2 + 1, text: modelResp || 'No response', sender: 'bot' }
              ]
            };
          });
          
          // Display only backend chats
          setChats(formattedChats);
          const storageKey = getChatStorageKey();
          localStorage.setItem(storageKey, JSON.stringify(formattedChats));
        }
      }
    } catch (error) {
      console.error('Failed to fetch chats from backend:', error);
      // Fallback to localStorage if backend fails
      const storageKey = getChatStorageKey();
      const savedChats = localStorage.getItem(storageKey);
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
    }
  };

  // Load chats from backend on mount
  useEffect(() => {
    fetchChatsFromBackend();
    setIsInitialized(true);
  }, []);

  // Save chats to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isInitialized) {
      const storageKey = getChatStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(chats));
    }
  }, [chats, isInitialized]);

  // Listen for chat updates from other components
  useEffect(() => {
    const handleChatsUpdated = () => {
      const storageKey = getChatStorageKey();
      const savedChats = localStorage.getItem(storageKey);
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
    };
    window.addEventListener('chats-updated', handleChatsUpdated);
    return () => window.removeEventListener('chats-updated', handleChatsUpdated);
  }, []);

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

  const confirmDeleteChat = async () => {
    const { chatId: deleteChatId } = confirmDialog;
    
    const backendId = deleteChatId?.replace('chat-', '');
    
    try {
      await fetch(`/api/chats/${backendId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to delete chat from backend:', error);
    }

    // Remove from local state regardless
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
        {isOpen && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <HiLightningBolt className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold whitespace-nowrap">Threadwork</span>
            </div>
          </div>
        )}

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
        <div className={`flex-1 overflow-y-auto px-3 py-4 space-y-2 sidebar-scroll ${isOpen ? '' : 'opacity-0'}`}>
          {chats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div key={chat.id}>
                {editingChatId === chat.id ? (
                  <div className="flex gap-2 p-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      className="flex-1 px-2 py-1 text-sm bg-gray-800 text-white rounded border border-purple-600 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(chat.id)}
                      className="text-green-500 hover:text-green-400"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="text-red-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <Link
                    to={`/chat/${chat.id}`}
                    className={`p-3 rounded-lg cursor-pointer transition-colors text-sm truncate group flex items-center justify-between ${
                      chatId === chat.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                    title={chat.title}
                  >
                    <span className="truncate flex-1">{chat.title}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
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
