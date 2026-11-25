# LÉO IA — Assistente de Academia Inteligente

> **"Experiência que orienta."**  
> Aplicativo mobile-first para musculação inteligente e assistência biomecânica em tempo real. Desenvolvido com foco em preservação articular, orientação postural, cronometragem automática de descanso e canal direto com instrutores de academia.

---

## 🛠️ Stack Tecnológica

- **Framework:** React 19 (Functional Components + Hooks)
- **Linguagem:** TypeScript
- **Build & Bundler:** Vite 8
- **Estilização:** Tailwind CSS v4 (Paleta *Luminous Nocturne*)
- **Ícones:** Lucide React
- **Arquitetura:** Component-based SPA organizada em camadas (`components`, `pages`, `models`, `services`, `shared`)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v22 ou superior)
- npm ou yarn

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:3000`.

### 3. Build de Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`.

### 4. Validação de Tipos e Lint
```bash
npm run lint
```

## Supabase (autenticação e chat)

### Configuração local

1. Copie `.env.example` para `.env.local`.
2. No painel do Supabase, abra **Project Settings > API** e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a URL e a chave pública (anon/publishable) do projeto.
3. No painel, em **Authentication > URL Configuration**, adicione `http://localhost:3000/**` como URL de redirecionamento. Configure também a URL de produção quando publicar o app.
4. Em **SQL Editor**, execute o conteúdo de `supabase/migrations/20261124000000_initial_schema.sql` e, em seguida, `supabase/migrations/20261124113000_workout_code.sql`. Se a migração inicial já foi executada, execute somente a segunda para adicionar a chave dos treinos.
5. Inicie o frontend com `npm run dev`, crie uma conta e confirme o e-mail caso a confirmação esteja habilitada no projeto.

As chaves `VITE_*` são incluídas no frontend e não devem ser secretas. Nunca coloque a chave `service_role` nem `GEMINI_API_KEY` em arquivos `VITE_*` ou no navegador.

### Chat com Gemini

O chat usa a Edge Function `chat-message`; a chave do Gemini deve ser cadastrada em **Project Settings > Edge Functions > Secrets** como `GEMINI_API_KEY`. Defina também `APP_ORIGIN` como a origem do frontend (por exemplo, `http://localhost:3000`) e inclua essa URL nos redirecionamentos permitidos em **Authentication > URL Configuration**. Depois, implante a função `supabase/functions/chat-message` usando o Supabase CLI:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy chat-message
```

O limite inicial é de 10 mensagens por usuário por minuto. Para login Google ou Apple, habilite o provedor em **Authentication > Providers** e configure as credenciais e URLs de callback exigidas pelo Supabase.

### Persistência dos dados

A autenticação, o perfil e os planos/progresso dos treinos são salvos no Supabase. Os treinos são isolados por usuário via RLS; na primeira carga, os planos iniciais são criados para a conta, e o cache local existente da conta é migrado quando não há treinos remotos. O histórico de sessões e as conversas ainda usam `localStorage`.

---

## 📁 Estrutura de Diretórios

```
/
├── public/                 # Assets públicos e imagens oficiais do LÉO IA
├── src/
│   ├── components/         # Componentes compartilhados e modais
│   │   ├── BottomNav.tsx                # Barra de navegação inferior (5 abas acessíveis)
│   │   ├── Header.tsx                   # Cabeçalho unificado com notificações e perfil
│   │   ├── ExerciseAlternativeModal.tsx # Substituição de exercícios biomecânicos
│   │   ├── InstructorReferralModal.tsx  # Modal de encaminhamento ao instrutor
│   │   └── WorkoutTimerModal.tsx        # Timer de descanso em tela cheia
│   ├── models/             # Tipagens e contratos TypeScript
│   │   ├── auth.model.ts
│   │   ├── chat.model.ts
│   │   ├── history.model.ts
│   │   ├── user.model.ts
│   │   └── workout.model.ts
│   ├── pages/              # Telas principais da aplicação
│   │   ├── DashboardPage.tsx     # Visão geral, próximo treino e status biomecânico
│   │   ├── WorkoutPage.tsx       # Execução de treino, séries, cargas e timer ativo
│   │   ├── ChatPage.tsx          # Conversa com LÉO IA, histórico de sessões e cards
│   │   ├── HistoryPage.tsx       # Calendário interativo, estatísticas e treinos passados
│   │   ├── ProfilePage.tsx       # Gestão de perfil, academia, biometria e suporte
│   │   ├── LoginPage.tsx         # Acesso à conta e recuperação de senha
│   │   ├── PasswordRecoveryPage.tsx # Redefinição de senha via link do Supabase
│   │   ├── RegisterPage.tsx      # Onboarding completo com dados físicos e objetivos
│   │   └── PreferencesPage.tsx   # Configurações biomecânicas e articulares
│   ├── services/           # Autenticação/perfil Supabase e serviços locais em migração
│   │   ├── auth.service.ts       # Supabase Auth e perfil
│   │   ├── chat.service.ts       # Gemini via Edge Function; conversas ainda locais
│   │   ├── history.service.ts
│   │   └── workout.service.ts
│   ├── shared/             # Constantes globais, temas e hooks reutilizáveis
│   │   ├── constants.ts          # Avatar oficial, paleta e dados iniciais
│   │   └── useAccessibleModal.ts # Hook de acessibilidade WAI-ARIA (focus trap e Escape)
│   ├── App.tsx             # Roteamento de telas e estado de autenticação
│   ├── main.tsx            # Entry point do React
│   └── index.css           # Estilos globais e tokens Tailwind
├── supabase/
│   ├── migrations/         # Tabelas e políticas RLS
│   └── functions/          # Edge Functions, incluindo o chat Gemini
├── docs/                   # Documentação técnica e planejamento de handoff
│   ├── STATUS_TECNICO.md   # Diagnóstico completo, itens auditados e corrigidos
│   └── PROXIMOS_PASSOS.md  # Roadmap e divisão de tarefas para 3 desenvolvedores
└── package.json
```

---

## 🎨 Identidade Visual (Luminous Nocturne)

O aplicativo segue estritamente a identidade visual escura em tons de roxo profundo e realce esmeralda:

| Nome do Token | Cor Hex | Uso Principal |
|---|---|---|
| **Canvas** | `#0B0712` | Fundo principal da aplicação |
| **Card / Surface** | `#160E26` | Superfície dos cards e containers |
| **Card Elevated** | `#1F1433` | Cards com elevação e inputs |
| **Border Soft** | `#311C50` / `rgba(255,255,255,0.08)` | Divisores e bordas estruturais |
| **Primary Purple** | `#842BAF` | Botões principais, gradientes e destaques |
| **Light Lavender** | `#B784E6` | Rótulos, links, ícones de foco e anéis de seleção |
| **Accent Green** | `#2BED77` | Sucesso, status ativo e indicador de conclusão |
| **Text Contrast** | `#EADDFC` / `#FFFFFF` | Textos primários com conformidade WCAG AA |
| **Text Muted** | `#A59DB5` | Textos secundários (contraste >= 4.5:1) |

---

## 👥 Fluxo de Trabalho em Equipe (Git Workflow)

1. **Branch Principal (`main`):**
   - Código de produção estável e verificado.
   - Deploys e versões prontas para homologação.
2. **Branch de Desenvolvimento (`develop`):**
   - Integração das features finalizadas antes da versão estável.
3. **Feature Branches (`feature/nome-da-tarefa`):**
   - Cada membro trabalha em uma branch isolada (ex: `feature/backend-auth`, `feature/gemini-streaming`, `feature/instructor-portal`).
4. **Convenções de Commits:**
   - `feat:` Nova funcionalidade
   - `fix:` Correção de bug
   - `docs:` Alterações na documentação
   - `refactor:` Melhoria de código sem alteração funcional
   - `test:` Inclusão de testes
