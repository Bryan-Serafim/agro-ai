import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Project, Chat } from '../types/database';

interface ProjectsScreenProps {
  onChatSelect: (chatId: string) => void;
}

export default function ProjectsScreen({ onChatSelect }: ProjectsScreenProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectChats, setProjectChats] = useState<Record<string, Chat[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);

      if (data.length > 0) {
        const projectIds = data.map(p => p.id);
        const { data: allChats } = await supabase
          .from('chats')
          .select('*')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        if (allChats) {
          const chatsByProject: Record<string, Chat[]> = {};
          allChats.forEach(chat => {
            if (!chatsByProject[chat.project_id!]) {
              chatsByProject[chat.project_id!] = [];
            }
            chatsByProject[chat.project_id!].push(chat);
          });
          setProjectChats(chatsByProject);
        }
      }
    }
    setLoading(false);
  };

  const loadProjectChats = async (projectId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjectChats((prev) => ({ ...prev, [projectId]: data }));
    }
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (!error) {
      await loadProjects();
    }
  };

  const createNewChat = async (projectId: string) => {
    if (!user) return;

    const chatName = prompt('Digite um nome para o chat:');
    if (!chatName || !chatName.trim()) return;

    const { data, error } = await supabase.from('chats').insert({
      user_id: user.id,
      project_id: projectId,
      title: chatName.trim(),
    }).select().single();

    if (!error && data) {
      await loadProjectChats(projectId);
      onChatSelect(data.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-light dark:bg-gray-900">
      <div className="bg-forest-green text-white py-4 px-4 safe-top shadow-lg">
        <h1 className="text-xl font-montserrat font-bold">Projetos</h1>
        <p className="text-sm text-white/80 font-roboto">Organize suas lavouras e cultivos</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 dark:text-gray-400 font-roboto mb-4">
              Você ainda não tem projetos
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Crie um projeto ao iniciar um chat
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              const chats = projectChats[project.id] || [];

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-montserrat font-semibold text-lg text-gray-dark dark:text-white">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-roboto">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {chats.length} {chats.length === 1 ? 'conversa' : 'conversas'}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleProject(project.id)}
                          className="text-forest-green hover:text-green-700 p-2"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                      <button
                        onClick={() => createNewChat(project.id)}
                        className="w-full bg-golden-yellow text-gray-dark font-montserrat font-medium py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors mb-3 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Novo Chat
                      </button>

                      {chats.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                          Nenhum chat neste projeto
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {chats.map((chat) => (
                            <button
                              key={chat.id}
                              onClick={() => onChatSelect(chat.id)}
                              className="w-full bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-forest-green" />
                                <div className="text-left">
                                  <p className="font-roboto text-sm text-gray-dark dark:text-white">
                                    {chat.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(chat.created_at).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
