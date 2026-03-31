import { useState } from 'react';
import { LogOut, Moon, Sun, HelpCircle, Info, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import FAQModal from './FAQModal';
import AboutModal from './AboutModal';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
      await signOut();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-light dark:bg-gray-900">
      <div className="bg-forest-green text-white py-4 px-4 safe-top shadow-lg">
        <h1 className="text-xl font-montserrat font-bold">Configurações</h1>
        <p className="text-sm text-white/80 font-roboto">Gerencie sua conta</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-roboto">Logado como</p>
            <p className="font-montserrat font-medium text-gray-dark dark:text-white mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={toggleDarkMode}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Sun className="w-5 h-5 text-golden-yellow" />
                ) : (
                  <Moon className="w-5 h-5 text-forest-green" />
                )}
                <span className="font-roboto text-gray-dark dark:text-white">
                  {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                </span>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-forest-green' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  } mt-0.5`}
                />
              </div>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setShowFAQ(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-forest-green" />
                <span className="font-roboto text-gray-dark dark:text-white">Dúvidas Comuns</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setShowAbout(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-forest-green" />
                <span className="font-roboto text-gray-dark dark:text-white">Sobre o AgroAí</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full p-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="font-roboto text-red-600 font-medium">Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>

      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
