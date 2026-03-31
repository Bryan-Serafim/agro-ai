import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import BottomNavigation from './components/BottomNavigation';
import ChatScreen from './components/ChatScreen';
import ProjectsScreen from './components/ProjectsScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import ChatsDrawer from './components/ChatsDrawer';

type Tab = 'chat' | 'projects' | 'history' | 'settings';

function AppContent() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showChatsDrawer, setShowChatsDrawer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChatCreated = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveTab('chat');
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveTab('chat');
  };

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-light dark:bg-gray-900">
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatScreen
            activeChatId={activeChatId}
            onChatCreated={handleChatCreated}
            onOpenChatsDrawer={() => setShowChatsDrawer(true)}
          />
        )}
        {activeTab === 'projects' && <ProjectsScreen onChatSelect={handleChatSelect} />}
        {activeTab === 'history' && <HistoryScreen onChatSelect={handleChatSelect} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <ChatsDrawer
        isOpen={showChatsDrawer}
        onClose={() => setShowChatsDrawer(false)}
        onChatSelect={handleChatSelect}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
