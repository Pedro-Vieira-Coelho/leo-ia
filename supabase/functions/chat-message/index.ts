import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'http://localhost:3000';
const corsHeaders = {
  'Access-Control-Allow-Origin': appOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LEO_SYSTEM_PROMPT = `
# IDENTIDADE E PAPEL
Você é o LÉO, um assistente virtual de treino com postura de instrutor de academia didático, acolhedor e objetivo.
- Seu papel é ajudar o aluno a organizar treinos, entender a execução de exercícios, adaptar movimentos e lidar com situações comuns da academia.
- Você NÃO substitui um profissional de Educação Física presencial nem um médico ou fisioterapeuta.

# USO DE DADOS DO ALUNO (REGRA CRÍTICA)
- Utilize apenas os dados listados na seção "DADOS CADASTRADOS DO ALUNO" abaixo quando forem relevantes para personalizar a resposta (ex.: chamar pelo nome, adequar explicações ao nível de experiência ou objetivo, respeitar limitações ativas).
- Nunca invente, presuma ou deduza informações que não estejam explicitamente registradas nos dados cadastrados ou na conversa atual. Se um dado não estiver disponível, informe com transparência e pergunte diretamente ao aluno.

# ESTILO E CONCISÃO (REGRA RÍGIDA)
- Responda sempre em português brasileiro.
- Seja extremamente direto e conciso: entregue respostas de no máximo 3 a 4 linhas curtas ou 2 a 3 tópicos breves.
- Evite introduções longas, rodeios ou repetições. Vá direto ao ponto prático.

# SITUAÇÕES COMUNS DA ACADEMIA
1. Máquina ou equipamento lotado: sugira imediatamente 1 ou 2 exercícios equivalentes que trabalhem o mesmo grupo muscular com halteres, barra ou peso corporal, sem interromper o treino.
2. Cansaço durante o treino: ajude o aluno a diferenciar fadiga muscular normal de esforço excessivo; sugira ajustar a carga, aumentar o descanso entre séries ou encerrar a sessão caso haja exaustão extrema.
3. Dúvidas de execução ou organização: explique os pontos-chave da postura de forma simples e visual.

# TRIAGEM DE DOR, DESCONFORTO E SEGURANÇA (DIRETRIZ CRÍTICA)
Nunca diagnostique doenças, lesões ou causas clínicas da dor, e nunca incentive o aluno a "treinar por cima da dor". Diferencie os cenários:

- Desconforto leve ou localizado (ex.: punho incomodando em exercício que não exige carga direta nele, como treino de pernas):
  1. Não insista no movimento que gera incômodo.
  2. Faça uma triagem rápida perguntando como é esse desconforto (intensidade, se é pontada ou cansaço).
  3. Sugira alternativas seguras que não sobrecarreguem a região afetada, sem encerrar o treino inteiro sem necessidade.

- Sinais de alerta ou emergência (dor aguda/intensa, fisgada súbita, dormência, formigamento, tontura, falta de ar, dor no peito ou dor persistente que piora):
  1. Oriente a INTERROMPER imediatamente o exercício e o treino.
  2. Recomende buscar avaliação de um médico ou profissional de saúde presencial.
  3. Não sugira exercícios alternativos nesse cenário.
`.trim();

function pickString(profile: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const val = profile[key];
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return undefined;
}

function pickPositiveNumber(profile: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const val = profile[key];
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      return val;
    }
    if (typeof val === 'string' && val.trim()) {
      const parsed = Number(val.replace(',', '.'));
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return undefined;
}

function pickStringList(profile: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const val = profile[key];
    if (Array.isArray(val)) {
      const items = val
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
      if (items.length > 0) return items;
    } else if (typeof val === 'string' && val.trim()) {
      const items = val
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (items.length > 0) return items;
    }
  }
  return [];
}

function buildStudentContext(profile: Record<string, unknown>): string {
  const lines: string[] = [];

  const name = pickString(profile, ['name', 'full_name', 'fullName']);
  if (name) lines.push(`- Nome: ${name}`);

  const age = pickPositiveNumber(profile, ['age', 'idade']);
  if (age) lines.push(`- Idade: ${age} anos`);

  const weightKg = pickPositiveNumber(profile, ['weightKg', 'weight_kg', 'weight', 'peso']);
  if (weightKg) lines.push(`- Peso: ${weightKg} kg`);

  const heightCm = pickPositiveNumber(profile, ['heightCm', 'height_cm', 'height', 'altura']);
  if (heightCm) lines.push(`- Altura: ${heightCm} cm`);

  const primaryGoal = pickString(profile, ['primaryGoal', 'primary_goal', 'goal', 'objetivo']);
  if (primaryGoal) lines.push(`- Objetivo principal: ${primaryGoal}`);

  const biomechanicalFocus = pickString(profile, [
    'biomechanicalFocus',
    'biomechanical_focus',
    'trainingFocus',
    'training_focus',
    'foco',
  ]);
  if (biomechanicalFocus) lines.push(`- Foco biomecânico: ${biomechanicalFocus}`);

  const experienceLevel = pickString(profile, [
    'experienceLevel',
    'experience_level',
    'level',
    'experiencia',
  ]);
  if (experienceLevel) lines.push(`- Nível de experiência: ${experienceLevel}`);

  const experienceDetail = pickString(profile, [
    'experienceDetail',
    'experience_detail',
    'experienceNotes',
    'experience_notes',
  ]);
  if (experienceDetail) lines.push(`- Detalhe da experiência: ${experienceDetail}`);

  const weeklyFrequency = pickPositiveNumber(profile, [
    'weeklyFrequency',
    'weekly_frequency',
    'frequency',
    'frequencia_semanal',
  ]);
  if (weeklyFrequency) lines.push(`- Frequência semanal: ${weeklyFrequency}x por semana`);

  const trainingDays = pickStringList(profile, [
    'trainingDays',
    'training_days',
    'dias_treino',
    'workoutDays',
  ]);
  if (trainingDays.length > 0) {
    lines.push(`- Dias de treino: ${trainingDays.join(', ')}`);
  }

  const availability = pickString(profile, ['availability', 'disponibilidade', 'schedule']);
  if (availability) lines.push(`- Disponibilidade: ${availability}`);

  const activeLimitations = pickStringList(profile, [
    'activeLimitations',
    'active_limitations',
    'limitations',
    'limitacoes',
  ]);
  if (activeLimitations.length > 0) {
    lines.push(`- Limitações ativas: ${activeLimitations.join(', ')}`);
  }

  const additionalNotes = pickString(profile, [
    'additionalNotes',
    'additional_notes',
    'notes',
    'observacoes',
  ]);
  if (additionalNotes) lines.push(`- Observações adicionais: ${additionalNotes}`);

  if (lines.length === 0) {
    return '\n\n# DADOS CADASTRADOS DO ALUNO\nNenhum dado de perfil preenchido pelo aluno até o momento.';
  }

  return `\n\n# DADOS CADASTRADOS DO ALUNO\n${lines.join('\n')}`;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
];

async function callGemini(geminiApiKey: string, fullSystemInstruction: string, userMessage: string) {
  let lastResponse: Response | null = null;

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiApiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: fullSystemInstruction }],
            },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: {
              maxOutputTokens: 450,
              temperature: 0.4,
            },
          }),
        },
      );

      if (response.ok) return response;

      lastResponse = response;
      console.warn(`Modelo ${model} retornou ${response.status}. Tentando fallback...`);

      // Tenta o próximo modelo em caso de indisponibilidade, cota ou modelo bloqueado
      if (response.status !== 503 && response.status !== 429 && response.status !== 404) {
        return response;
      }
    } catch (err) {
      console.warn(`Timeout/erro de rede no modelo ${model}:`, err);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastResponse) return lastResponse;
  throw new Error('Todos os modelos Gemini falharam ou excederam o tempo limite.');
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

  const { data: profileRow, error: profileError } = await adminClient
    .from('profiles')
    .select('profile')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Falha ao buscar perfil do aluno:', profileError.message);
  }

  const rawProfile = (
    profileRow?.profile ??
    userData.user.user_metadata?.profile ??
    {}
  ) as Record<string, unknown>;

  if (!rawProfile.name && typeof userData.user.user_metadata?.full_name === 'string') {
    rawProfile.name = userData.user.user_metadata.full_name;
  }

  const fullSystemInstruction = `${LEO_SYSTEM_PROMPT}${buildStudentContext(rawProfile)}`;

  let geminiResponse: Response;
  try {
    geminiResponse = await callGemini(geminiApiKey, fullSystemInstruction, message.trim());
    if (geminiResponse.status === 503 || geminiResponse.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      geminiResponse = await callGemini(geminiApiKey, fullSystemInstruction, message.trim());
    }
  } catch (err) {
    console.error('Falha ou timeout ao chamar o Gemini:', err);
    return jsonResponse(504, { error: 'O LÉO demorou para responder. Tente novamente.' });
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text().catch(() => '');
    console.error(`Gemini respondeu com status ${geminiResponse.status}:`, errText);
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