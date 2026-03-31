import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Chat } from '../types/database';

interface ChatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onChatSelect: (chatId: string) => void;
}

export default function ChatsDrawer({ isOpen, onClose, onChatSelect }: ChatsDrawerProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadChats();
    }
  }, [isOpen, user]);

  const loadChats = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .is('project_id', null)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChats(data);
    }
    setLoading(false);
  };

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
        <div className="bg-forest-green text-white py-4 px-4 flex justify-between items-center">
          <h2 className="text-lg font-montserrat font-bold">Chats Soltos</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Carregando...</p>
          ) : chats.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-roboto">Nenhum chat solto</p>
              <p className="text-sm mt-2">Chats sem projeto aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="w-full text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-forest-green flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-montserrat font-medium text-gray-dark dark:text-white truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(chat.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
