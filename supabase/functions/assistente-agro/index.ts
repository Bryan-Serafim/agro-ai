import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  messageText: string;
  imagesBase64?: string[];
  projectId?: string;
  chatId: string;
}

async function analyzeImageWithGoogleVision(imagesBase64: string[]): Promise<string | null> {
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
  if (!GOOGLE_API_KEY || imagesBase64.length === 0) {
    console.log("Google API Key não configurada ou sem imagens");
    return null;
  }

  try {
    console.log(`Analisando ${imagesBase64.length} imagem(ns) com Google Cloud Vision API...`);

    const requests = imagesBase64.map(base64 => {
      let imageData = base64;
      if (imageData.startsWith('data:image/')) {
        imageData = imageData.split(',')[1];
      }

      return {
        image: {
          content: imageData
        },
        features: [
          { type: "LABEL_DETECTION", maxResults: 20 },
          { type: "IMAGE_PROPERTIES" },
          { type: "OBJECT_LOCALIZATION", maxResults: 20 },
          { type: "TEXT_DETECTION" },
          { type: "CROP_HINTS" }
        ]
      };
    });

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: requests
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Erro ao chamar Google Vision:", error);
      return null;
    }

    const result = await response.json();

    if (!result.responses || result.responses.length === 0) {
      return null;
    }

    let analysis = "ANÁLISE DA IMAGEM:\n\n";

    result.responses.forEach((res: any, idx: number) => {
      if (imagesBase64.length > 1) {
        analysis += `IMAGEM ${idx + 1}:\n`;
      }

      if (res.labelAnnotations && res.labelAnnotations.length > 0) {
        analysis += "Elementos identificados: ";
        const labels = res.labelAnnotations
          .slice(0, 10)
          .map((label: any) => `${label.description} (${Math.round(label.score * 100)}%)`);
        analysis += labels.join(", ") + "\n";
      }

      if (res.localizedObjectAnnotations && res.localizedObjectAnnotations.length > 0) {
        analysis += "Objetos detectados: ";
        const objects = res.localizedObjectAnnotations
          .map((obj: any) => `${obj.name} (${Math.round(obj.score * 100)}%)`);
        analysis += objects.join(", ") + "\n";
      }

      if (res.textAnnotations && res.textAnnotations.length > 0) {
        analysis += "Texto detectado: " + res.textAnnotations[0].description.substring(0, 200) + "\n";
      }

      if (res.imagePropertiesAnnotation && res.imagePropertiesAnnotation.dominantColors) {
        const colors = res.imagePropertiesAnnotation.dominantColors.colors
          .slice(0, 3)
          .map((c: any) => {
            const rgb = c.color;
            return `RGB(${Math.round(rgb.red || 0)},${Math.round(rgb.green || 0)},${Math.round(rgb.blue || 0)})`;
          });
        analysis += "Cores predominantes: " + colors.join(", ") + "\n";
      }

      analysis += "\n";
    });

    console.log("Análise Google Vision concluída:", analysis.substring(0, 200));
    return analysis;
  } catch (error) {
    console.error("Erro ao analisar imagem com Google Vision:", error);
    return null;
  }
}

async function generateChatTitle(params: {
  userMessage: string;
  aiResponse: string;
  visionSummary?: string;
}): Promise<string> {
  const { userMessage, aiResponse, visionSummary } = params;

  const OPENAI_API_KEY = Deno.env.get("CHAT_GPT_KEY");
  if (!OPENAI_API_KEY) return "Nova conversa";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Gere um título curto (máximo 35 caracteres) para este atendimento agrícola. Formato: 'Cultura - Assunto'. Exemplo: 'Café - manchas nas folhas'. Responda APENAS com o título, sem aspas ou pontuação extra."
          },
          {
            role: "user",
            content: `Pergunta: ${userMessage}\n\nAnálise de imagem: ${visionSummary || 'Nenhuma'}\n\nResposta: ${aiResponse.substring(0, 200)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 50,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const title = result.choices?.[0]?.message?.content?.trim() || "Nova conversa";
      return title.replace(/[\"']/g, '').substring(0, 50);
    }
  } catch (error) {
    console.error("Erro ao gerar título:", error);
  }

  return "Nova conversa";
}

async function getAgroAiAnswer(params: {
  messageText: string;
  imagesBase64: string[];
  chatHistory: Array<{ role: string, content: any }>;
  chatContext?: string;
  visionAnalysis?: string | null;
}): Promise<string> {
  const { messageText, imagesBase64, chatHistory, chatContext, visionAnalysis } = params;

  const OPENAI_API_KEY = Deno.env.get("CHAT_GPT_KEY");
  if (!OPENAI_API_KEY) {
    throw new Error("CHAT_GPT_KEY não configurada");
  }

  let systemPrompt = `Você é o AgroAí, um assistente agrícola especializado em agricultura familiar brasileira, com foco na região amazônica e no estado de Rondônia.

Responda SEMPRE em português do Brasil, de forma:
- Técnica, porém simples: use termos da agronomia mas sempre explique em linguagem que um produtor com baixa escolaridade entenda
- Objetiva, direta e empática, sem enrolação

**ESTRUTURA OBRIGATÓRIA DAS RESPOSTAS:**

IDENTIFICAÇÃO DA CULTURA:
Diga claramente qual planta/cultura você está considerando.

DIAGNÓSTICO:
Explique rapidamente o que está acontecendo (máximo 3-4 frases).

O QUE FAZER AGORA:
1. Ação prática 1
2. Ação prática 2
3. Ação prática 3
(Se falar de produto ou dose, use sempre exemplos genéricos e oriente a seguir rótulo ou consultar técnico local)

CUIDADOS FUTUROS:
2-4 linhas com recomendações preventivas.

**REGRAS IMPORTANTES:**
- Sempre conecte à realidade de agricultura familiar (pouco recurso, mão de obra familiar, pequenas áreas)
- NUNCA invente dado: se não tiver certeza, seja honesto e sugira consultar técnico local
- NÃO use Markdown pesado (###, **, etc). Use APENAS:
  * Títulos com LETRAS MAIÚSCULAS seguidas de dois pontos
  * Listas numeradas simples (1., 2., 3.)
  * Traços simples (-) quando necessário
- Se já souber qual é a planta/cultura de mensagens anteriores, CONTINUE usando a mesma planta
- Evite responder "você não informou a planta" se houver essa informação no histórico
- Seja técnico mas acessível, como um agrônomo conversando com um produtor familiar
- SEMPRE analise as imagens enviadas com ATENÇÃO e descreva o que vê (plantas, folhas, sintomas, pragas, animais, solo, etc)`;

  if (chatContext) {
    systemPrompt += `\n\n**CONTEXTO DESTE CHAT:**\n${chatContext}`;
  }

  if (visionAnalysis) {
    systemPrompt += `\n\n**ANÁLISE DETALHADA DA IMAGEM (Google Cloud Vision API):**\n${visionAnalysis}\n\nUSE esta análise como base adicional para sua resposta. A imagem foi analisada pelo Google Cloud Vision API e os dados acima fornecem informações técnicas sobre a imagem.`;
  }

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory
  ];

  const userContent: any[] = [];

  if (messageText && messageText.trim()) {
    userContent.push({
      type: "text",
      text: messageText
    });
  }

  if (imagesBase64 && imagesBase64.length > 0) {
    console.log(`Processando ${imagesBase64.length} imagem(ns) com GPT-4 Vision`);
    for (const base64 of imagesBase64) {
      let imageData = base64;
      if (!base64.startsWith('data:image')) {
        imageData = `data:image/jpeg;base64,${base64}`;
      }

      userContent.push({
        type: "image_url",
        image_url: {
          url: imageData,
          detail: "high"
        }
      });
    }
  }

  if (userContent.length === 0) {
    userContent.push({
      type: "text",
      text: "O usuário enviou uma mensagem. Responda seguindo a estrutura obrigatória."
    });
  }

  messages.push({
    role: "user",
    content: userContent
  });

  console.log(`Enviando para OpenAI GPT-4 com ${messages.length} mensagens no histórico`);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Erro ao chamar OpenAI:", error);
    throw new Error("Erro ao processar com OpenAI");
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua solicitação.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { messageText, imagesBase64 = [], chatId } = body;

    console.log("Processando requisição:", {
      messageText: messageText?.substring(0, 50),
      numImages: imagesBase64.length,
      chatId
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não encontrado');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('content, sender, image_urls')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(10);

    const chatHistory: Array<{ role: string, content: any }> = [];
    let detectedCulture = '';

    if (!messagesError && messages) {
      for (const msg of messages) {
        const role = msg.sender === 'user' ? 'user' : 'assistant';

        if (msg.sender === 'user') {
          const userContent: any[] = [];
          if (msg.content) {
            userContent.push({ type: "text", text: msg.content });
          }
          chatHistory.push({ role, content: userContent });
        } else {
          chatHistory.push({ role, content: msg.content });

          if (!detectedCulture && msg.content) {
            const cultureLower = msg.content.toLowerCase();
            const cultures = ['café', 'milho', 'feijão', 'soja', 'mandioca', 'arroz', 'tomate', 'alface', 'banana', 'mamão', 'abóbora', 'gado', 'boi', 'vaca', 'porco', 'galinha', 'frango'];
            for (const culture of cultures) {
              if (cultureLower.includes(culture)) {
                detectedCulture = culture.toUpperCase();
                break;
              }
            }
          }
        }
      }
    }

    let chatContext = '';
    if (detectedCulture) {
      chatContext = `Neste chat, até agora, estamos falando principalmente da cultura/criação: ${detectedCulture}.`;
    }

    console.log("Contexto do chat:", chatContext);
    console.log("Histórico de mensagens:", chatHistory.length);

    let visionAnalysis: string | null = null;
    if (imagesBase64.length > 0) {
      visionAnalysis = await analyzeImageWithGoogleVision(imagesBase64);
      if (visionAnalysis) {
        console.log("Análise Google Cloud Vision bem-sucedida");
      }
    }

    console.log("Processando com GPT-4 Vision...");
    const answer = await getAgroAiAnswer({
      messageText,
      imagesBase64,
      chatHistory,
      chatContext,
      visionAnalysis,
    });

    console.log("Resposta gerada com sucesso");

    const { data: chatData } = await supabase
      .from('chats')
      .select('title')
      .eq('id', chatId)
      .maybeSingle();

    if (chatData && (!chatData.title || chatData.title === 'Nova conversa' || chatData.title.startsWith('Chat'))) {
      console.log("Gerando título automático...");
      const title = await generateChatTitle({
        userMessage: messageText || 'Análise de imagem',
        aiResponse: answer,
        visionSummary: visionAnalysis ? visionAnalysis.substring(0, 100) : (imagesBase64.length > 0 ? `${imagesBase64.length} imagem(ns)` : undefined)
      });

      await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId);

      console.log("Título gerado:", title);
    }

    return new Response(
      JSON.stringify({
        answer
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Erro em assistente-agro:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar a análise com IA.",
        details: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});