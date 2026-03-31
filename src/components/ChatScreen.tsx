import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Send, X, Menu, Mic, Volume2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
  Message,
  Chat,
  ChatInsert,
  MessageInsert,
  Json
} from '../types/database';

const getImageUrls = (jsonUrls: Json | undefined | null): string[] => {
  if (Array.isArray(jsonUrls)) {
    return jsonUrls.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

interface ChatScreenProps {
  activeChatId: string | null;
  onChatCreated?: (chatId: string) => void;
  onOpenChatsDrawer?: () => void;
}

export default function ChatScreen({ activeChatId, onChatCreated, onOpenChatsDrawer }: ChatScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [showAudioToast, setShowAudioToast] = useState(false);
  const [audioToastMessage, setAudioToastMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeChatId) {
      loadChat();
      loadMessages();
    } else {
      setMessages([]);
      setCurrentChat(null);
    }
  }, [activeChatId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    if (!activeChatId) return;

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', activeChatId)
      .maybeSingle();

    if (!error && data) {
      setCurrentChat(data);
    }
  };

  const loadMessages = async () => {
    if (!activeChatId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', activeChatId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const createNewChat = async (chatName: string, projectId?: string) => {
    if (!user) return null;

    const chatPayload: ChatInsert = {
      user_id: user.id,
      project_id: projectId || null,
      title: chatName,
    };

    const { data, error } = await supabase
      .from('chats')
      .insert(chatPayload)
      .select()
      .single();

    if (!error && data) {
      return data.id;
    }

    return null;
  };

  const handleInitialAction = async () => {
    if (activeChatId) {
      handleSend();
    } else {
      const chatId = await createNewChat('Nova conversa', undefined);
      if (chatId && onChatCreated) {
        onChatCreated(chatId);
        await new Promise(resolve => setTimeout(resolve, 100));
        await handleSend();
      }
    }
  };


  const handleSend = async () => {
    if ((!inputText.trim() && selectedImages.length === 0) || loading || !activeChatId) return;

    setLoading(true);

    const messageText = inputText.trim();
    const imagesToSend = [...selectedImages];

    const messagePayload: MessageInsert = {
      chat_id: activeChatId,
      content: messageText || null,
      image_urls: imagesToSend,
      sender: 'user',
    };

    const { error } = await supabase.from('messages').insert(messagePayload);

    if (!error) {
      setInputText('');
      setSelectedImages([]);
      await loadMessages();

      try {
        console.log('Chamando Edge Function via supabase.functions.invoke');
        console.log('Com imagens:', imagesToSend.length);

        const { data, error: functionError } = await supabase.functions.invoke('assistente-agro', {
          body: {
            messageText,
            imagesBase64: imagesToSend,
            chatId: activeChatId,
          },
        });

        if (functionError) {
          console.error('Erro na invoke:', functionError);
          throw new Error(functionError.message || 'Erro ao processar com IA');
        }

        console.log('Resposta da IA recebida:', data);

        const aiAnswer = data?.answer || 'Desculpe, não consegui processar sua solicitação.';
        
        const aiMessagePayload: MessageInsert = {
          chat_id: activeChatId,
          content: aiAnswer,
          image_urls: [],
          sender: 'assistant',
        };

        await supabase.from('messages').insert(aiMessagePayload);

        await loadMessages();
      } catch (error: unknown) {
        console.error('Erro ao chamar IA:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('Detalhes do erro:', errorMessage);

        const errorPayload: MessageInsert = {
          chat_id: activeChatId,
          content: `Erro técnico: ${errorMessage}. Por favor, tente novamente.`,
          image_urls: [],
          sender: 'assistant',
        };

        await supabase.from('messages').insert(errorPayload);
        await loadMessages();
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 2 - selectedImages.length); i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length + selectedImages.length <= 2) {
            setSelectedImages((prev) => [...prev, ...newImages].slice(0, 2));
          }
        }
      };
      reader.readAsDataURL(files[i]);
    }

    if (files.length + selectedImages.length > 2) {
      alert('Você pode adicionar no máximo 2 imagens por mensagem');
    }
  };

  const handleCamera = () => {
    if (selectedImages.length >= 2) {
      alert('Você pode adicionar no máximo 2 imagens por mensagem');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGallery = () => {
    if (selectedImages.length >= 2) {
      alert('Você pode adicionar no máximo 2 imagens por mensagem');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMicClick = () => {
    setAudioToastMessage('Em breve você poderá enviar dúvidas por áudio');
    setShowAudioToast(true);
    setTimeout(() => setShowAudioToast(false), 3000);
  };

  const handleSpeakerClick = () => {
    setAudioToastMessage('Em breve o AgroAí vai ler as respostas em áudio para você');
    setShowAudioToast(true);
    setTimeout(() => setShowAudioToast(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-light dark:bg-gray-900">
      <div className="bg-forest-green text-white py-4 px-4 safe-top shadow-lg flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-montserrat font-bold">
            {currentChat ? currentChat.title : 'Chat'}
          </h1>
          <p className="text-sm text-white/80 font-roboto">Tire suas dúvidas sobre a lavoura</p>
        </div>
        {onOpenChatsDrawer && (
          <button
            onClick={onOpenChatsDrawer}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-40">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="font-roboto">Comece uma conversa</p>
              <p className="text-sm mt-2">Envie uma mensagem ou foto</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const imageUrls = getImageUrls(message.image_urls);
              
              return (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 relative ${message.sender === 'user'
                    ? 'bg-forest-green text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-dark dark:text-white'
                    }`}
                >
                  {message.sender === 'assistant' && (
                    <button
                      onClick={handleSpeakerClick}
                      className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Ouvir resposta (em breve)"
                    >
                      <Volume2 className="w-4 h-4 text-forest-green dark:text-green-400" />
                    </button>
                  )}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Imagem ${idx + 1}`}
                          className="rounded-lg w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {message.content && <p className="font-roboto text-sm whitespace-pre-line pr-8">{message.content}</p>}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )})}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-forest-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-forest-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-forest-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Analisando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        {selectedImages.length > 0 && (
          <div className="flex gap-2 mb-3">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={handleCamera}
            className="bg-forest-green text-white p-3 rounded-full hover:bg-green-700 transition-colors flex-shrink-0"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            onClick={handleGallery}
            className="bg-forest-green text-white p-3 rounded-full hover:bg-green-700 transition-colors flex-shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleMicClick}
            className="bg-forest-green text-white p-3 rounded-full hover:bg-green-700 transition-colors flex-shrink-0"
            title="Enviar áudio (em breve)"
          >
            <Mic className="w-5 h-5" />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-forest-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-dark dark:text-white max-h-32"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />

          <button
            onClick={handleInitialAction}
            disabled={(!inputText.trim() && selectedImages.length === 0) || loading}
            className="bg-golden-yellow text-gray-dark p-3 rounded-full hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          multiple
        />
      </div>

      {showAudioToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="text-sm font-roboto text-center">{audioToastMessage}</p>
        </div>
      )}
    </div>
  );
}
