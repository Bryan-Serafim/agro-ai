import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  messageText?: string;
  imagesBase64?: string[];
  chatId?: string;
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: "text"; text: string }>;
};

function normalizeBase64Image(base64: string): string {
  if (base64.startsWith("data:image")) {
    return base64;
  }
  return `data:image/jpeg;base64,${base64}`;
}

function truncateText(text: string, max = 400): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function detectCultureFromText(text: string): string {
  const cultures = [
    "café",
    "milho",
    "feijão",
    "soja",
    "mandioca",
    "arroz",
    "tomate",
    "alface",
    "banana",
    "mamão",
    "abóbora",
    "gado",
    "boi",
    "vaca",
    "porco",
    "galinha",
    "frango",
  ];

  const lower = text.toLowerCase();
  for (const culture of cultures) {
    if (lower.includes(culture)) {
      return culture.toUpperCase();
    }
  }

  return "";
}

async function generateChatTitle(params: {
  userMessage: string;
  aiResponse: string;
}): Promise<string> {
  const { userMessage, aiResponse } = params;

  const openAiApiKey = Deno.env.get("CHAT_GPT_KEY");
  if (!openAiApiKey) {
    return "Nova conversa";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 40,
        messages: [
          {
            role: "system",
            content:
              "Gere um título curto, natural e útil para esta conversa agrícola. Máximo de 35 caracteres. Formato preferencial: 'Cultura - problema'. Responda apenas com o título, sem aspas.",
          },
          {
            role: "user",
            content: `Pergunta do usuário: ${truncateText(userMessage, 160)}\nResposta gerada: ${truncateText(aiResponse, 180)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao gerar título:", errorText);
      return "Nova conversa";
    }

    const result = await response.json();
    const title = result.choices?.[0]?.message?.content?.trim() || "Nova conversa";

    return title.replace(/[\"']/g, "").slice(0, 50);
  } catch (error) {
    console.error("Erro inesperado ao gerar título:", error);
    return "Nova conversa";
  }
}

async function getAgroAiAnswer(params: {
  messageText: string;
  imagesBase64: string[];
  chatHistory: ChatMessage[];
  chatContext?: string;
}): Promise<string> {
  const { messageText, imagesBase64, chatHistory, chatContext } = params;

  const openAiApiKey = Deno.env.get("CHAT_GPT_KEY");
  if (!openAiApiKey) {
    throw new Error("CHAT_GPT_KEY não configurada");
  }

  let systemPrompt = `Você é o AgroAí, um assistente agrícola especializado em agricultura familiar brasileira, com foco na região amazônica e no estado de Rondônia.

Responda SEMPRE em português do Brasil, de forma:
- Técnica, porém simples: use termos da agronomia, mas sempre explique em linguagem que um produtor com baixa escolaridade entenda
- Objetiva, direta e empática, sem enrolação

ESTRUTURA OBRIGATÓRIA DAS RESPOSTAS:

IDENTIFICAÇÃO DA CULTURA:
Diga claramente qual planta, cultura ou criação você está considerando.

DIAGNÓSTICO:
Explique rapidamente o que está acontecendo em no máximo 3 ou 4 frases.

O QUE FAZER AGORA:
1. Ação prática 1
2. Ação prática 2
3. Ação prática 3

CUIDADOS FUTUROS:
Escreva de 2 a 4 linhas com recomendações preventivas.

REGRAS IMPORTANTES:
- Sempre conecte a resposta à realidade da agricultura familiar, com pouco recurso e pequena escala
- Nunca invente dados. Se não tiver certeza, diga isso claramente e oriente procurar um técnico local
- Não use markdown pesado
- Use apenas títulos em maiúsculas seguidos de dois pontos
- Use listas numeradas simples
- Se a cultura já aparecer no histórico, mantenha a continuidade
- Se houver imagens, analise com atenção o que aparece visualmente
- Se falar de produto, dose ou manejo sensível, use exemplos genéricos e oriente a seguir rótulo, bula e apoio técnico local`;

  if (chatContext) {
    systemPrompt += `\n\nCONTEXTO DESTE CHAT:\n${chatContext}`;
  }

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
  ];

  const userContent: any[] = [];

  if (messageText.trim()) {
    userContent.push({
      type: "text",
      text: messageText,
    });
  }

  for (const base64 of imagesBase64) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: normalizeBase64Image(base64),
        detail: "high",
      },
    });
  }

  if (userContent.length === 0) {
    userContent.push({
      type: "text",
      text: "O usuário enviou uma mensagem sem conteúdo legível. Responda de forma útil e peça mais detalhes.",
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        ...messages,
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao chamar OpenAI:", errorText);
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
    const messageText = body.messageText?.trim() || "";
    const imagesBase64 = Array.isArray(body.imagesBase64) ? body.imagesBase64.filter(Boolean) : [];
    const chatId = body.chatId?.trim();

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: "chatId é obrigatório" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!messageText && imagesBase64.length === 0) {
      return new Response(
        JSON.stringify({ error: "Envie texto, imagem ou ambos" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autorização não encontrado" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("content, sender")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(10);

    if (messagesError) {
      console.error("Erro ao buscar histórico:", messagesError);
    }

    const chatHistory: ChatMessage[] = [];
    let detectedCulture = "";

    if (messages) {
      for (const msg of messages) {
        const role = msg.sender === "user" ? "user" : "assistant";

        if (role === "user") {
          const text = msg.content || "";
          chatHistory.push({
            role: "user",
            content: [{ type: "text", text }],
          });
        } else {
          const text = msg.content || "";
          chatHistory.push({
            role: "assistant",
            content: text,
          });

          if (!detectedCulture && text) {
            detectedCulture = detectCultureFromText(text);
          }
        }
      }
    }

    if (!detectedCulture && messageText) {
      detectedCulture = detectCultureFromText(messageText);
    }

    const chatContext = detectedCulture
      ? `Neste chat, até agora, a cultura ou criação principal parece ser: ${detectedCulture}.`
      : "";

    const answer = await getAgroAiAnswer({
      messageText,
      imagesBase64,
      chatHistory,
      chatContext,
    });

    const { data: chatData, error: chatDataError } = await supabase
      .from("chats")
      .select("title")
      .eq("id", chatId)
      .maybeSingle();

    if (chatDataError) {
      console.error("Erro ao buscar chat:", chatDataError);
    }

    if (
      chatData &&
      (!chatData.title ||
        chatData.title === "Nova conversa" ||
        chatData.title.startsWith("Chat"))
    ) {
      const title = await generateChatTitle({
        userMessage: messageText || "Análise com imagem",
        aiResponse: answer,
      });

      const { error: updateTitleError } = await supabase
        .from("chats")
        .update({ title })
        .eq("id", chatId);

      if (updateTitleError) {
        console.error("Erro ao atualizar título:", updateTitleError);
      }
    }

    return new Response(
      JSON.stringify({ answer }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("Erro em assistente-agro:", error);

    return new Response(
      JSON.stringify({
        error: "Erro ao processar a análise com IA.",
        details: error?.message || "Erro interno",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});