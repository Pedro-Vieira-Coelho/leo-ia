# Roteiro de Próximos Passos & Divisão de Trabalho — LÉO IA

Este documento orienta a continuidade do desenvolvimento do projeto LÉO IA, dividindo as frentes de trabalho para **3 desenvolvedores** atuarem em paralelo sem conflitos de merge ou dependência bloqueante.

---

## 🎯 Divisão de Frentes de Trabalho

```
                  ┌──────────────────────────────────────────────┐
                  │                 LÉO IA CORE                  │
                  │       Frontend React 19 + TypeScript         │
                  └──────────────────────┬───────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│   INTEGRANTE 1   │           │   INTEGRANTE 2   │           │   INTEGRANTE 3   │
│  Backend, Auth & │           │   IA Biomecânica │           │ Painel Instrutor │
│  Banco de Dados  │           │   Gemini API     │           │  & WebSockets    │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 👤 Integrante 1: Backend, Autenticação Real & Banco de Dados

### Escopo
Substituir o armazenamento temporário de `localStorage` por uma camada de persistência robusta em nuvem e gerenciar sessões seguras com tokens JWT.

### Tarefas
1. **Modelagem de Dados (PostgreSQL / Cloud SQL ou Firestore):**
   - Tabela/Coleção `users`: Dados pessoais, biometria (peso, altura, idade), preferências do LÉO e vínculos de academia.
   - Tabela/Coleção `workouts`: Fichas cadastradas (A, B, C), exercícios, cargas e prescrições do instrutor.
   - Tabela/Coleção `workout_logs`: Histórico de treinos finalizados, duração, data, cargas atingidas e feedbacks.
   - Tabela/Coleção `chat_sessions`: Sessões de conversa e histórico de mensagens por usuário.

2. **Endpoints da API REST (Node.js/Express):**
   - `POST /api/auth/register` & `POST /api/auth/login`: Autenticação e emissão de JWT seguro (HttpOnly cookies ou Bearer token).
   - `GET /api/user/profile` & `PUT /api/user/profile`: Leitura e atualização de perfil e preferências.
   - `GET /api/workouts/active` & `PUT /api/workouts/progress`: Sincronização do treino atual.
   - `POST /api/workouts/complete`: Finalização com validação de duplicidade e registro no histórico.
   - `GET /api/history`: Busca agregada de estatísticas e filtros por período.

3. **Arquivos a integrar no Frontend:**
   - Atualizar `src/services/auth.service.ts` e `src/services/history.service.ts` para consumir os novos endpoints via `fetch` autenticado.

---

## 🤖 Integrante 2: Inteligência Artificial Biomecânica (Gemini API)

### Escopo
Conectar o assistente LÉO IA ao modelo de linguagem de ponta via SDK oficial `@google/genai` com streaming de texto em tempo real e system prompt especializado em biomecânica e preservação articular.

### Tarefas
1. **Configuração de Rota Server-Side para IA:**
   - Criar rota segura `POST /api/chat/stream` protegida por autenticação, garantindo que a `GEMINI_API_KEY` nunca seja exposta no cliente.
   - Utilizar o modelo recomendado `gemini-2.5-flash` via `@google/genai`.

2. **System Instruction Especializada do LÉO IA:**
   - Personificar o personagem LÉO IA: Treinador experiente, cordial, pragmático, com foco absoluto em execução postural correta, preservação lombar e articular, e cadência controlada (1s concêntrica / 3s excêntrica).
   - Injetar no contexto as limitações ativas do usuário (ex: condromalácia, protrusão discal, impacto femoroacetabular).
   - Regra de segurança: Se o aluno relatar dor aguda ou lesão aparente, orientar interrupção imediata e sugerir acionamento do instrutor ou médico.

3. **Streaming & Structured Actions:**
   - Implementar leitura de resposta via `ReadableStream` para exibição de digitação em tempo real no balão de conversa do `ChatPage.tsx`.
   - Adicionar retorno de ações contextuais estruturadas (ex: `{ action: "SUGGEST_SWAP", from: "Supino Reto", to: "Supino com Halteres" }`).

4. **Arquivos a integrar no Frontend:**
   - Atualizar `src/services/chat.service.ts` para consumir a rota com streaming e emitir eventos incrementais para a interface.

---

## 🏋️ Integrante 3: Módulo do Instrutor Humano & Notificações em Tempo Real

### Escopo
Conectar a ponta do aluno à equipe de instrutores da academia, permitindo envio de solicitações, respostas de dúvidas posturais e acompanhamento de adesão aos treinos.

### Tarefas
1. **Encaminhamento de Chamados (`InstructorReferralModal`):**
   - Criar serviço de mensageria para armazenar chamados com status (`pendente`, `em_analise`, `respondido`).
   - Permitir anexar o contexto do treino atual (exercício onde sentiu desconforto, carga utilizada e horário).

2. **Comunicação em Tempo Real (WebSockets / Server-Sent Events):**
   - Notificar o aluno imediatamente quando o instrutor Carlos Silva (ou outro profissional vinculado) responder a uma dúvida ou prescrever uma alteração de ficha.
   - Sincronizar o badge de notificações no componente `Header.tsx`.

3. **Painel do Instrutor (Backoffice / Visão do Profissional):**
   - Criar visão básica para o instrutor visualizar a lista de seus alunos afiliados, últimas cargas registradas e chamados em aberto.

4. **Arquivos a integrar no Frontend:**
   - Atualizar `src/components/InstructorReferralModal.tsx` e `src/components/Header.tsx` para refletir dados do serviço em tempo real.

---

## ⏱️ Cronograma Sugerido de Sprints

| Sprint | Duração | Entregáveis |
|---|---|---|
| **Sprint 1** | 1 semana | Setup do banco de dados, endpoints de autenticação e proxy server-side do Gemini. |
| **Sprint 2** | 1 semana | Conexão do Chat com streaming real do Gemini e persistência do histórico de treinos. |
| **Sprint 3** | 1 semana | Integração do módulo de chamados ao instrutor com WebSockets e testes integrados E2E. |
