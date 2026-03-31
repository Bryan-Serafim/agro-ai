import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQModalProps {
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQModal({ onClose }: FAQModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Como tirar uma foto?',
      answer:
        'Na aba Chat, clique no ícone da câmera ao lado do campo de texto. Isso abrirá a câmera do seu dispositivo para tirar uma foto diretamente.',
    },
    {
      question: 'Como enviar uma imagem da galeria?',
      answer:
        'Na aba Chat, clique no ícone de imagem (galeria) ao lado do campo de texto. Você poderá selecionar até 2 imagens já salvas no seu dispositivo.',
    },
    {
      question: 'Quantas imagens posso enviar de uma vez?',
      answer:
        'Você pode enviar até 2 imagens por mensagem. Se tentar adicionar mais, o aplicativo irá avisá-lo do limite.',
    },
    {
      question: 'O que é um Projeto?',
      answer:
        'Um Projeto é uma forma de organizar suas conversas. Por exemplo, você pode criar um projeto chamado "Lavoura de Café - Talhão 3" e agrupar todas as conversas relacionadas a essa área específica.',
    },
    {
      question: 'Como criar um Projeto?',
      answer:
        'Ao enviar sua primeira mensagem em um novo chat, o sistema perguntará se você quer criar um projeto. Se escolher "Sim", basta dar um nome e uma descrição (opcional) para o projeto.',
    },
    {
      question: 'Posso ter conversas sem projeto?',
      answer:
        'Sim! Quando o sistema perguntar se você quer criar um projeto, você pode escolher "Não" e a conversa continuará normalmente, sem estar vinculada a nenhum projeto.',
    },
    {
      question: 'Como criar uma nova conversa em um projeto existente?',
      answer:
        'Na aba Projetos, encontre o projeto desejado, toque para expandir e clique em "Novo Chat". A nova conversa já estará automaticamente vinculada ao projeto.',
    },
    {
      question: 'Onde vejo todas as minhas conversas?',
      answer:
        'Na aba Histórico, você encontra todas as suas conversas, tanto as vinculadas a projetos quanto as conversas soltas. Você pode ver quantas mensagens cada conversa tem e a data de criação.',
    },
    {
      question: 'Posso excluir uma conversa?',
      answer:
        'Sim! No Histórico, cada conversa tem um ícone de lixeira. Ao clicar, será pedida uma confirmação antes de excluir definitivamente.',
    },
    {
      question: 'O que acontece se eu excluir um projeto?',
      answer:
        'Ao excluir um projeto, o sistema pedirá confirmação. As conversas vinculadas ao projeto podem ser mantidas no histórico ou excluídas, dependendo da configuração.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-montserrat font-bold text-gray-dark dark:text-white">
            Dúvidas Comuns
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-roboto font-medium text-gray-dark dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-forest-green flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {expandedIndex === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="font-roboto text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
