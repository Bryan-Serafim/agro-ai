# Configuração de IA - AgroAí

## Variáveis de Ambiente Necessárias

Para que a integração com IA funcione, você precisa configurar as seguintes chaves de API no Supabase:

### 1. OpenAI API Key

**Nome da variável:** `OPENAI_API_KEY`

**Como obter:**
1. Acesse https://platform.openai.com/api-keys
2. Crie uma conta ou faça login
3. Clique em "Create new secret key"
4. Copie a chave gerada

**Como configurar no Supabase:**
1. Acesse o dashboard do Supabase
2. Vá em Settings → Edge Functions → Secrets
3. Adicione uma nova secret com nome `OPENAI_API_KEY` e cole o valor da chave

### 2. Google Cloud Vision API Key

**Nome da variável:** `GOOGLE_VISION_API_KEY`

**Como obter:**
1. Acesse https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Cloud Vision API"
4. Vá em "Credentials" e crie uma "API Key"
5. Copie a chave gerada

**Como configurar no Supabase:**
1. Acesse o dashboard do Supabase
2. Vá em Settings → Edge Functions → Secrets
3. Adicione uma nova secret com nome `GOOGLE_VISION_API_KEY` e cole o valor da chave

## Como Funciona

### Fluxo de Processamento

1. **Usuário envia mensagem** (texto e/ou até 2 imagens)
2. **Mensagem é salva** no banco de dados
3. **Edge Function é chamada** com:
   - Texto da mensagem
   - Imagens em base64
   - ID do chat
4. **Se houver imagens:**
   - Google Cloud Vision API analisa cada imagem
   - Retorna labels (rótulos) e cores dominantes
   - Exemplo: "Labels detectados: leaf, fungus, disease, rust, corn..."
5. **OpenAI processa tudo:**
   - Recebe o texto técnico da Embrapa (atualmente um texto fixo de exemplo)
   - Recebe o resumo da análise de imagem
   - Recebe a pergunta do usuário
   - Gera resposta em português simples
6. **Resposta é salva** no banco e exibida no chat

### Modelos Utilizados

- **Google Cloud Vision:** Label Detection + Image Properties
- **OpenAI:** GPT-4o-mini (rápido e econômico)

### Custos Estimados

- **Google Vision:** ~$1.50 por 1.000 imagens analisadas
- **OpenAI GPT-4o-mini:** ~$0.15 por 1M tokens de entrada, ~$0.60 por 1M tokens de saída

## Personalizações Futuras

### 1. Textos Técnicos da Embrapa

Atualmente usa um texto fixo. Para melhorar:

```typescript
// Na Edge Function, substitua a variável articleText por:
const articleText = await buscarTextoTecnico(projectId, messageText);
```

Você pode criar uma tabela `technical_articles` no Supabase com:
- Título
- Conteúdo
- Palavras-chave
- Categoria (praga, doença, manejo, etc.)

### 2. Melhorar Análise de Imagens

Para doenças específicas de plantas, considere:
- Google Cloud Vision Plant Disease API
- Modelos customizados treinados com imagens de culturas específicas
- PlantVillage dataset

### 3. Histórico de Contexto

Para respostas mais contextualizadas:
```typescript
// Buscar últimas mensagens do chat
const historico = await buscarUltimasMensagens(chatId, 5);
```

## Troubleshooting

### Erro: "GOOGLE_VISION_API_KEY não configurada"
- Verifique se a secret foi criada no Supabase
- Nome deve ser exatamente `GOOGLE_VISION_API_KEY`

### Erro: "OPENAI_API_KEY não configurada"
- Verifique se a secret foi criada no Supabase
- Nome deve ser exatamente `OPENAI_API_KEY`

### Resposta demora muito
- Normal para primeira chamada (cold start)
- GPT-4o-mini é otimizado para velocidade
- Considere adicionar loading indicator mais informativo

### Análise de imagem imprecisa
- Google Vision é genérico
- Para melhorias, use modelos especializados em agricultura
- Combine com datasets de doenças de plantas

## Links Úteis

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
