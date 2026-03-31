import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, FolderKanban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Chat, Project } from '../types/database';

interface ChatWithProject extends Chat {
  project?: Project;
  messageCount?: number;
}

interface HistoryScreenProps {
  onChatSelect: (chatId: string) => void;
}

export default function HistoryScreen({ onChatSelect }: HistoryScreenProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;

    setLoading(true);

    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select(`
        *,
        projects (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!chatsError && chatsData) {
      const chatIds = chatsData.map(chat => chat.id);

      const { data: messageCounts } = await supabase
        .from('messages')
        .select('chat_id')
        .in('chat_id', chatIds);

      const countMap = new Map<string, number>();
      messageCounts?.forEach(msg => {
        countMap.set(msg.chat_id, (countMap.get(msg.chat_id) || 0) + 1);
      });

      const chatsWithDetails = chatsData.map((chat: any) => ({
        ...chat,
        messageCount: countMap.get(chat.id) || 0,
        project: chat.projects || undefined,
      }));

      setChats(chatsWithDetails);
    }

    setLoading(false);
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa?')) return;

    const { error } = await supabase.from('chats').delete().eq('id', chatId);

    if (!error) {
      await loadChats();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-light dark:bg-gray-900">
      <div className="bg-forest-green text-white py-4 px-4 safe-top shadow-lg">
        <h1 className="text-xl font-montserrat font-bold">Histórico</h1>
        <p className="text-sm text-white/80 font-roboto">Todas as suas conversas</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-roboto mb-2">
              Nenhuma conversa ainda
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Comece um chat para ver seu histórico
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => onChatSelect(chat.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-forest-green flex-shrink-0" />
                        <h3 className="font-montserrat font-semibold text-gray-dark dark:text-white">
                          {chat.title}
                        </h3>
                      </div>

                      {chat.project && (
                        <div className="flex items-center gap-2 mb-2">
                          <FolderKanban className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-roboto">
                            {chat.project.name}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(chat.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>
                          {chat.messageCount} {chat.messageCount === 1 ? 'mensagem' : 'mensagens'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 ml-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
