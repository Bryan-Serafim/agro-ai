import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types/database';

interface CreateProjectModalProps {
  onClose: () => void;
  onConfirm: (projectId?: string) => void;
}

export default function CreateProjectModal({ onClose, onConfirm }: CreateProjectModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'choice' | 'select' | 'create'>('choice');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && step === 'select') {
      loadProjects();
    }
  }, [user, step]);

  const loadProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  const handleConfirm = async () => {
    if (step === 'select') {
      if (!selectedProjectId) {
        alert('Por favor, selecione um projeto');
        return;
      }
      onConfirm(selectedProjectId);
      return;
    }

    if (step === 'create') {
      if (!projectName.trim()) {
        alert('Por favor, insira um nome para o projeto');
        return;
      }

      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: projectName.trim(),
            description: projectDescription.trim() || null,
          })
          .select()
          .single();

        setLoading(false);

        if (!error && data) {
          onConfirm(data.id);
        } else {
          alert('Erro ao criar projeto. Tente novamente.');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-montserrat font-bold text-gray-dark dark:text-white">
            {step === 'choice' && 'Vincular a um Projeto?'}
            {step === 'select' && 'Selecionar Projeto'}
            {step === 'create' && 'Criar Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'choice' && (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6 font-roboto">
              Você deseja vincular este chat a um projeto?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('select')}
                className="w-full bg-forest-green text-white font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Usar Projeto Existente
              </button>
              <button
                onClick={() => setStep('create')}
                className="w-full bg-golden-yellow text-gray-dark font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Criar Novo Projeto
              </button>
              <button
                onClick={() => onConfirm()}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-dark dark:text-white font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Sem Projeto
              </button>
            </div>
          </>
        )}

        {step === 'select' && (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4 font-roboto text-sm">
              Selecione um projeto existente
            </p>

            {projects.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 font-roboto">
                Você ainda não tem projetos criados
              </p>
            ) : (
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedProjectId === project.id
                        ? 'border-forest-green bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-forest-green'
                    }`}
                  >
                    <p className="font-montserrat font-medium text-gray-dark dark:text-white">
                      {project.name}
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-roboto">
                        {project.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('choice')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-dark dark:text-white font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedProjectId}
                className="flex-1 bg-golden-yellow text-gray-dark font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </>
        )}

        {step === 'create' && (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nome do Projeto *
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Lavoura de café"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-dark dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="projectDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Descrição (opcional)
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Ex: Talhão 3, plantio de março"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-dark dark:text-white resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('choice')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-dark dark:text-white font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-golden-yellow text-gray-dark font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
