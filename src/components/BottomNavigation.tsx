import { MessageSquare, FolderKanban, History, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'chat' | 'projects' | 'history' | 'settings';
  onTabChange: (tab: 'chat' | 'projects' | 'history' | 'settings') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { id: 'projects' as const, icon: FolderKanban, label: 'Projetos' },
    { id: 'history' as const, icon: History, label: 'Histórico' },
    { id: 'settings' as const, icon: Settings, label: 'Configurações' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom z-40">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-forest-green'
                  : 'text-gray-500 dark:text-gray-400 hover:text-forest-green'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs font-roboto ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
