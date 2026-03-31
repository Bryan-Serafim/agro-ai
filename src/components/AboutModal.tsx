import { X, Target, Cog, Heart, Award } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-montserrat font-bold text-gray-dark dark:text-white">
            Sobre o AgroAí
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-forest-green" />
                <h3 className="text-xl font-montserrat font-semibold text-gray-dark dark:text-white">
                  Nossa Missão
                </h3>
              </div>
              <p className="font-roboto text-gray-600 dark:text-gray-300 leading-relaxed">
                Apoiar a agricultura familiar com tecnologia acessível e inteligente. Queremos que
                cada agricultor tenha acesso a informações técnicas confiáveis de forma simples e
                prática, usando apenas o celular e a linguagem do dia a dia.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Cog className="w-6 h-6 text-forest-green" />
                <h3 className="text-xl font-montserrat font-semibold text-gray-dark dark:text-white">
                  Como Funciona
                </h3>
              </div>
              <p className="font-roboto text-gray-600 dark:text-gray-300 leading-relaxed">
                O AgroAí usa análise de imagens e chat inteligente para ajudar você a identificar
                problemas na lavoura, entender pragas e doenças, e receber orientações sobre manejo.
                Basta tirar uma foto ou fazer uma pergunta, e nosso assistente vai te ajudar com
                informações baseadas em conteúdo técnico validado.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-forest-green" />
                <h3 className="text-xl font-montserrat font-semibold text-gray-dark dark:text-white">
                  Nosso Compromisso
                </h3>
              </div>
              <ul className="space-y-2 font-roboto text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-forest-green mt-1">•</span>
                  <span>Informações baseadas em conteúdos técnicos validados por especialistas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-green mt-1">•</span>
                  <span>Linguagem simples e acessível, sem jargões técnicos desnecessários</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-green mt-1">•</span>
                  <span>Respeito ao conhecimento e experiência do produtor rural</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-green mt-1">•</span>
                  <span>Privacidade e segurança das suas informações</span>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-forest-green" />
                <h3 className="text-xl font-montserrat font-semibold text-gray-dark dark:text-white">
                  Nossos Valores
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="font-montserrat font-medium text-forest-green mb-1">
                    Acessibilidade
                  </p>
                  <p className="font-roboto text-sm text-gray-600 dark:text-gray-400">
                    Tecnologia ao alcance de todos
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="font-montserrat font-medium text-forest-green mb-1">Confiança</p>
                  <p className="font-roboto text-sm text-gray-600 dark:text-gray-400">
                    Informações técnicas validadas
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="font-montserrat font-medium text-forest-green mb-1">Simplicidade</p>
                  <p className="font-roboto text-sm text-gray-600 dark:text-gray-400">
                    Interface intuitiva e fácil
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="font-montserrat font-medium text-forest-green mb-1">Respeito</p>
                  <p className="font-roboto text-sm text-gray-600 dark:text-gray-400">
                    Valorização do agricultor
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-montserrat font-semibold text-gray-dark dark:text-white mb-3 text-center">
                Nossa Equipe
              </h3>
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/image.png"
                  alt="Equipe AgroAí"
                  className="w-full h-auto object-cover"
                />
              </div>
            </section>

            <section className="bg-forest-green/10 dark:bg-forest-green/20 p-4 rounded-lg">
              <p className="font-roboto text-sm text-center text-gray-dark dark:text-white">
                <span className="font-medium">AgroAí</span> - Assistente Agrícola Inteligente
                <br />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Versão 1.0 - 2024
                </span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
