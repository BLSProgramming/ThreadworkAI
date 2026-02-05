import { useRef, useCallback } from 'react';

/**
 * Hook for managing chat persistence (localStorage and backend)
 */
export const useChatPersistence = () => {
  const persistTimerRef = useRef(null);
  const pendingPersistRef = useRef(null);

  // Get user-specific localStorage key
  const getChatStorageKey = useCallback(() => {
    const userId = localStorage.getItem('current_user_id');
    return userId ? `chats_user_${userId}` : 'chats';
  }, []);

  // Format chat data for PostgreSQL storage
  const formatChatForDatabase = useCallback((chatId, title, messages) => {
    return {
      chat_id: chatId,
      title: title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: messages.map(msg => {
        if (msg.sender === 'user') {
          return {
            message_id: msg.id.toString(),
            sender: 'user',
            user_prompt: msg.text,
            created_at: new Date().toISOString()
          };
        } else {
          const responses = msg.allResponses ? Object.values(msg.allResponses) : [];
          const modelNames = msg.allResponses ? Object.keys(msg.allResponses) : [];
          
          return {
            message_id: msg.id.toString(),
            sender: 'bot',
            user_prompt: null,
            synthesized_response: msg.text,
            model1_name: modelNames[0] || null,
            model1_response: responses[0] || null,
            model2_name: modelNames[1] || null,
            model2_response: responses[1] || null,
            model3_name: modelNames[2] || null,
            model3_response: responses[2] || null,
            model4_name: modelNames[3] || null,
            model4_response: responses[3] || null,
            created_at: new Date().toISOString()
          };
        }
      })
    };
  }, []);

  // Batch localStorage writes to reduce churn during streaming
  const persistChats = useCallback((updater) => {
    const storageKey = getChatStorageKey();
    const chats = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = updater(chats);
    pendingPersistRef.current = { key: storageKey, data: updated };

    if (!persistTimerRef.current) {
      persistTimerRef.current = setTimeout(() => {
        const payload = pendingPersistRef.current;
        if (payload) {
          localStorage.setItem(payload.key, JSON.stringify(payload.data));
          setTimeout(() => window.dispatchEvent(new Event('chats-updated')), 0);
        }
        pendingPersistRef.current = null;
        persistTimerRef.current = null;
      }, 60);
    }

    return updated;
  }, [getChatStorageKey]);

  // Save chat to database
  const saveChatToDatabase = useCallback(async (chatId) => {
    const storageKey = getChatStorageKey();
    const chats = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const chat = chats.find(c => c.id === chatId);
    
    if (!chat) return;

    const dbPayload = formatChatForDatabase(chat.id, chat.title, chat.messages);
    
    // Store formatted data in localStorage as backup
    const dbChats = JSON.parse(localStorage.getItem('dbChats') || '[]');
    const existingIndex = dbChats.findIndex(c => c.chat_id === chatId);
    
    if (existingIndex !== -1) {
      dbChats[existingIndex] = dbPayload;
    } else {
      dbChats.push(dbPayload);
    }
    
    localStorage.setItem('dbChats', JSON.stringify(dbChats));
    
    // Save to backend
    try {
      await fetch('/api/chats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
    } catch (error) {
      console.error('Failed to save chat to database:', error);
    }
  }, [formatChatForDatabase, getChatStorageKey]);

  // Fetch chats from backend
  const fetchChatsFromBackend = useCallback(async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.status}`);
      }
      const data = await response.json();
      return data.chats || [];
    } catch (error) {
      console.error('Failed to fetch chats from backend:', error);
      return [];
    }
  }, []);

  return {
    persistChats,
    saveChatToDatabase,
    fetchChatsFromBackend,
    formatChatForDatabase,
    getChatStorageKey,
  };
};
