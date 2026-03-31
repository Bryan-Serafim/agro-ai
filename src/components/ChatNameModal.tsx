import { useState } from 'react';
import { X } from 'lucide-react';

interface ChatNameModalProps {
  onClose: () => void;
  onConfirm: (chatName: string) => void;
}

export default function ChatNameModal({ onClose, onConfirm }: ChatNameModalProps) {
  const [chatName, setChatName] = useState('');

  const handleConfirm = () => {
    if (!chatName.trim()) {
      alert('Por favor, insira um nome para o chat');
      return;
    }
    onConfirm(chatName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-montserrat font-bold text-gray-dark dark:text-white">
            Nome do Chat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 font-roboto text-sm">
          Dê um nome para identificar esta conversa
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="chatName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nome *
            </label>
            <input
              id="chatName"
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Ex: Problema nas folhas do café"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-dark dark:text-white"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-dark dark:text-white font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-golden-yellow text-gray-dark font-montserrat font-medium py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
