import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'http://localhost:3000';
const corsHeaders = {
  'Access-Control-Allow-Origin': appOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  const requestOrigin = request.headers.get('Origin');
  if (requestOrigin && requestOrigin !== appOrigin) {
    return jsonResponse(403, { error: 'Origem não permitida.' });
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return jsonResponse(401, { error: 'Faça login para enviar uma mensagem.' });
  }

  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return jsonResponse(400, { error: 'Corpo da requisição inválido.' });
  }

  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return jsonResponse(400, { error: 'A mensagem deve ter entre 1 e 2000 caracteres.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !geminiApiKey) {
    console.error('Configuração da função chat-message incompleta.');
    return jsonResponse(500, { error: 'O serviço de chat não está configurado.' });
  }

  const authClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !userData.user) {
    return jsonResponse(401, { error: 'Sessão inválida. Entre novamente.' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: allowed, error: rateLimitError } = await adminClient.rpc(
    'consume_chat_rate_limit',
    { p_user_id: userData.user.id },
  );

  if (rateLimitError) {
    console.error('Falha ao verificar limite do chat.');
    return jsonResponse(500, { error: 'Não foi possível processar a solicitação.' });
  }
  if (!allowed) {
    return jsonResponse(429, { error: 'Limite de mensagens atingido. Tente novamente em um minuto.' });
  }

  const geminiResponse = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'Você é o LÉO, um assistente informativo de exercícios. Não diagnostique doenças nem substitua um médico ou profissional de educação física. Não incentive treinar com dor. Se a pessoa relatar dor, lesão ou condição de saúde, recomende interromper o exercício e buscar orientação profissional presencial. Responda em português brasileiro, com cuidado e objetividade.',
          }],
        },
        contents: [{ parts: [{ text: message.trim() }] }],
        generationConfig: {
          maxOutputTokens: 500,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    },
  );

  if (!geminiResponse.ok) {
    console.error(`Gemini respondeu com status ${geminiResponse.status}.`);
    return jsonResponse(502, { error: 'A IA está indisponível no momento. Tente novamente.' });
  }

  const result = await geminiResponse.json();
  const text = result?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    return jsonResponse(502, { error: 'A IA não retornou uma resposta válida. Tente novamente.' });
  }

  return jsonResponse(200, { text });
});
