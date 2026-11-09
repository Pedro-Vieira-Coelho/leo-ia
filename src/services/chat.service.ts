import { ChatConversation, ChatMessage, SuggestedPrompt } from '../models/chat.model';
import { SUGGESTED_PROMPTS } from '../shared/constants';

class ChatService {
  private readonly STORAGE_KEY = 'leo_ia_chat_conversations_v2';
  private readonly ACTIVE_ID_KEY = 'leo_ia_active_conversation_id';
  private conversations: ChatConversation[] = [];
  private activeConversationId: string = 'conv_1';
  private listeners: Array<() => void> = [];

  constructor() {
    this.initConversations();
  }

  private initConversations() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const storedActiveId = localStorage.getItem(this.ACTIVE_ID_KEY);

      if (stored) {
        this.conversations = JSON.parse(stored);
        if (storedActiveId && this.conversations.some(c => c.id === storedActiveId)) {
          this.activeConversationId = storedActiveId;
        } else if (this.conversations.length > 0) {
          this.activeConversationId = this.conversations[0].id;
        }
      } else {
        this.conversations = this.getDefaultConversations();
        this.activeConversationId = 'conv_1';
        this.save();
      }
    } catch {
      this.conversations = this.getDefaultConversations();
      this.activeConversationId = 'conv_1';
    }
  }

  private save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.conversations));
      localStorage.setItem(this.ACTIVE_ID_KEY, this.activeConversationId);
    } catch {
      // ignore
    }
  }

  private getDefaultConversations(): ChatConversation[] {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    return [
      {
        id: 'conv_1',
        title: 'Proteção dos ombros',
        createdAt: today,
        updatedAt: today,
        isPinned: true,
        contextWorkout: 'Treino A · Peito, Tríceps & Ombro',
        messages: [
          {
            id: 'msg_1',
            sender: 'leo',
            text: 'Olá, Carlos! Sou o LÉO, seu assistente de treino e biomecânica.\n\nVi que seu Treino A de hoje tem foco em Peito, Tríceps e Ombros. Como suas articulações estão se sentindo?',
            timestamp: '07:28',
            category: 'workout_adjustment'
          },
          {
            id: 'msg_2',
            sender: 'user',
            text: 'Bom dia, LÉO! O ombro direito está um pouco sensível hoje. Devo mudar o supino inclinado?',
            timestamp: '07:29'
          },
          {
            id: 'msg_3',
            sender: 'leo',
            text: 'Excelente decisão me avisar antes de começar, Carlos!\n\nPara preservar seu manguito rotador, recomendo adotar a pegada neutra e reduzir o banco de 45° para 30°. Também já deixei o "Chest Press articulado" como alternativa de backup se sentir qualquer fisgada.\n\nAtenção: interrompa o exercício imediatamente se sentir dor ou desconforto e procure a orientação presencial do Prof. Carlos Silva.',
            timestamp: '07:30',
            category: 'biomechanics',
            actionButton: {
              label: 'Ver alternativa no Treino A',
              actionType: 'navigate_workout',
              payload: 'Treino A'
            }
          }
        ]
      },
      {
        id: 'conv_2',
        title: 'Evolução no supino',
        createdAt: yesterday,
        updatedAt: yesterday,
        isPinned: false,
        contextWorkout: 'Treino A · Peito & Deltoide',
        messages: [
          {
            id: 'msg_2_1',
            sender: 'user',
            text: 'LÉO, consegui fechar as séries com 24 kg nos halteres hoje! O que acha de subir para 26 kg na próxima?',
            timestamp: 'Ontem 08:15'
          },
          {
            id: 'msg_2_2',
            sender: 'leo',
            text: 'Parabéns pela evolução consistente, Carlos!\n\nComo seu histórico requer cuidado com o ombro direito, minha orientação é consolidar essa carga de 24 kg por mais 2 sessões, mantendo a cadência de 3 segundos na descida excêntrica.\n\nQuando você completar todas as séries sem fadiga articular, aumentaremos a carga com total segurança biomecânica.',
            timestamp: 'Ontem 08:16',
            category: 'motivation',
            actionButton: {
              label: 'Ver histórico no Treino A',
              actionType: 'navigate_workout',
              payload: 'history'
            }
          }
        ]
      },
      {
        id: 'conv_3',
        title: 'Alternativas para treino de pernas',
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo,
        isPinned: false,
        contextWorkout: 'Treino C · Pernas & Panturrilhas',
        messages: [
          {
            id: 'msg_3_1',
            sender: 'user',
            text: 'Hoje o Leg Press 45° da academia estava com fila gigante. Qual máquina substitui sem perder o foco em quadríceps?',
            timestamp: '25 Out 18:40'
          },
          {
            id: 'msg_3_2',
            sender: 'leo',
            text: 'Sem problemas, Carlos! Você pode fazer o Hack Squat articulado ou o Agachamento Búlgaro com halteres leves.\n\nAmbos ativam intensamente os quadríceps e mantêm a estabilidade patelar preservada. Se preferir uma opção guiada rápida, a Cadeira Extensora com contração isométrica de 1 segundo no topo também funciona perfeitamente.',
            timestamp: '25 Out 18:41',
            category: 'workout_adjustment',
            actionButton: {
              label: 'Ver alternativas no Treino C',
              actionType: 'swap_exercise'
            }
          }
        ]
      },
      {
        id: 'conv_4',
        title: 'Dúvidas sobre postura',
        createdAt: fiveDaysAgo,
        updatedAt: fiveDaysAgo,
        isPinned: false,
        contextWorkout: 'Treino B · Costas & Bíceps',
        messages: [
          {
            id: 'msg_4_1',
            sender: 'user',
            text: 'Na remada baixa sentada, como garantir que estou puxando com as costas e não com os braços?',
            timestamp: '23 Out 08:20'
          },
          {
            id: 'msg_4_2',
            sender: 'leo',
            text: 'Ótima pergunta! A chave está na intenção motora: imagine que suas mãos são apenas ganchos e puxe guiando com a ponta dos cotovelos em direção aos bolsos da calça.\n\nAo final da puxada, feche as escápulas como se segurasse uma caneta entre elas, mantendo o peito estufado e os ombros baixos longe das orelhas.',
            timestamp: '23 Out 08:21',
            category: 'biomechanics'
          }
        ]
      },
      {
        id: 'conv_5',
        title: 'Organização do treino semanal',
        createdAt: twoWeeksAgo,
        updatedAt: twoWeeksAgo,
        isPinned: false,
        contextWorkout: 'Geral · Frequência 4x',
        messages: [
          {
            id: 'msg_5_1',
            sender: 'user',
            text: 'Minha rotina é treinar Seg, Ter, Qui e Sex. Como fica a recuperação entre os treinos?',
            timestamp: '18 Out 09:10'
          },
          {
            id: 'msg_5_2',
            sender: 'leo',
            text: 'Essa divisão de 4 dias é ideal para você, Carlos!\n\nA quarta-feira atua como descanso miofascial ativo entre o Treino A e o Treino C, e o final de semana garante a recuperação neuromuscular completa.\n\nSe em alguma semana você sentir fadiga acumulada na sexta, me avise para calibrarmos as séries.',
            timestamp: '18 Out 09:11',
            category: 'motivation'
          }
        ]
      }
    ];
  }

  public getConversations(): ChatConversation[] {
    return this.conversations;
  }

  public getActiveConversation(): ChatConversation {
    const found = this.conversations.find(c => c.id === this.activeConversationId);
    if (found) return found;

    if (this.conversations.length > 0) {
      this.activeConversationId = this.conversations[0].id;
      return this.conversations[0];
    }

    const created = this.createConversation('Nova conversa');
    return created;
  }

  public setActiveConversation(id: string) {
    if (this.conversations.some(c => c.id === id)) {
      this.activeConversationId = id;
      this.save();
      this.notify();
    }
  }

  public createConversation(title?: string): ChatConversation {
    const newId = `conv_${Date.now()}`;
    const now = new Date().toISOString();
    const newConv: ChatConversation = {
      id: newId,
      title: title || 'Nova conversa',
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      contextWorkout: 'Treino A · Peito, Tríceps & Ombro',
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'leo',
          text: 'Olá, Carlos! Como posso te orientar no treino de hoje? Podemos revisar a postura, adaptar exercícios para seus ombros ou ajustar os intervalos de descanso.',
          timestamp: this.getCurrentTime(),
          category: 'workout_adjustment'
        }
      ]
    };

    this.conversations.unshift(newConv);
    this.activeConversationId = newId;
    this.save();
    this.notify();
    return newConv;
  }

  public renameConversation(id: string, newTitle: string) {
    const conv = this.conversations.find(c => c.id === id);
    if (conv && newTitle.trim()) {
      conv.title = newTitle.trim();
      conv.updatedAt = new Date().toISOString();
      this.save();
      this.notify();
    }
  }

  public togglePinConversation(id: string) {
    const conv = this.conversations.find(c => c.id === id);
    if (conv) {
      conv.isPinned = !conv.isPinned;
      this.save();
      this.notify();
    }
  }

  public deleteConversation(id: string) {
    this.conversations = this.conversations.filter(c => c.id !== id);
    if (this.conversations.length === 0) {
      this.createConversation('Nova conversa');
    } else if (this.activeConversationId === id) {
      this.activeConversationId = this.conversations[0].id;
    }
    this.save();
    this.notify();
  }

  public searchConversations(query: string): ChatConversation[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.conversations;

    return this.conversations.filter(conv => {
      const matchTitle = conv.title.toLowerCase().includes(q);
      const matchContext = conv.contextWorkout ? conv.contextWorkout.toLowerCase().includes(q) : false;
      const matchMessages = conv.messages.some(m => m.text.toLowerCase().includes(q));
      return matchTitle || matchContext || matchMessages;
    });
  }

  public getMessages(): ChatMessage[] {
    return this.getActiveConversation().messages;
  }

  public getSuggestedPrompts(): SuggestedPrompt[] {
    return SUGGESTED_PROMPTS;
  }

  public sendMessage(userText: string): void {
    const currentConv = this.getActiveConversation();
    const nowTime = this.getCurrentTime();

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: nowTime
    };

    currentConv.messages.push(userMsg);
    currentConv.updatedAt = new Date().toISOString();

    // If it's a new conversation, title it appropriately from the first prompt
    if (currentConv.title === 'Nova conversa' && currentConv.messages.length <= 3) {
      currentConv.title = this.generateTitleFromPrompt(userText);
    }

    this.save();
    this.notify();

    // Generate response from LÉO
    setTimeout(() => {
      const response = this.generateLeoResponse(userText);
      currentConv.messages.push(response);
      currentConv.updatedAt = new Date().toISOString();
      this.save();
      this.notify();
    }, 600);
  }

  private generateTitleFromPrompt(prompt: string): string {
    const clean = prompt.trim();
    if (clean.length <= 25) return clean;
    if (clean.toLowerCase().includes('ombro') || clean.toLowerCase().includes('supino')) return 'Ajuste de supino & ombro';
    if (clean.toLowerCase().includes('postura')) return 'Orientações de postura';
    if (clean.toLowerCase().includes('alternativa') || clean.toLowerCase().includes('ocupado')) return 'Alternativas de aparelhos';
    if (clean.toLowerCase().includes('descanso') || clean.toLowerCase().includes('tempo')) return 'Intervalos de descanso';
    if (clean.toLowerCase().includes('progresso') || clean.toLowerCase().includes('evolu')) return 'Análise de progresso';
    return clean.slice(0, 22) + '...';
  }

  private generateLeoResponse(input: string): ChatMessage {
    const textLower = input.toLowerCase();
    const time = this.getCurrentTime();

    if (textLower.includes('ombro') || textLower.includes('supino') || textLower.includes('dor') || textLower.includes('articular') || textLower.includes('adaptar')) {
      return {
        id: `leo_${Date.now()}`,
        sender: 'leo',
        text: 'Atenção redobrada na articulação dos ombros!\n\nNo supino, mantenha sempre as escápulas firmes no encosto e os cotovelos a ~45° em relação ao tronco. Essa posição diminui o atrito no tendão do supraespinhal.\n\nAtenção: interrompa o exercício ao menor sinal de dor ou desconforto e procure a orientação direta do instrutor credenciado.',
        timestamp: time,
        category: 'instructor_referral',
        actionButton: {
          label: 'Encaminhar ao Prof. Carlos Silva',
          actionType: 'call_instructor',
          payload: 'Prof. Carlos Silva'
        }
      };
    }

    if (textLower.includes('descanso') || textLower.includes('intervalo') || textLower.includes('tempo')) {
      return {
        id: `leo_${Date.now()}`,
        sender: 'leo',
        text: 'Para o seu objetivo de hipertrofia funcional no Treino A, recomendo de 60s a 75s nos exercícios compostos (como supinos e desenvolvimentos) e de 45s a 60s nos isoladores de tríceps.\n\nAproveite a pausa para respirações profundas e hidratação.',
        timestamp: time,
        category: 'rest',
        actionButton: {
          label: 'Iniciar timer no Treino A',
          actionType: 'navigate_workout',
          payload: 'timer_60'
        }
      };
    }

    if (textLower.includes('ocupado') || textLower.includes('alternativa') || textLower.includes('substituir')) {
      return {
        id: `leo_${Date.now()}`,
        sender: 'leo',
        text: 'Sem problemas, Carlos! Se o banco inclinado estiver ocupado, você pode ir para o Crucifixo com polia média ou para o Peck Deck articulado.\n\nAmbos mantêm a ativação no peitoral com excelente segurança biomecânica.',
        timestamp: time,
        category: 'workout_adjustment',
        actionButton: {
          label: 'Ver alternativas no Treino A',
          actionType: 'swap_exercise'
        }
      };
    }

    if (textLower.includes('postura') || textLower.includes('execução') || textLower.includes('como fazer')) {
      return {
        id: `leo_${Date.now()}`,
        sender: 'leo',
        text: 'Excelente foco, Carlos! A postura dita a longevidade dos seus treinos.\n\nMantenha sempre os pés firmes no solo, abdômen ativado e cadência de 3 segundos na descida excêntrica.\n\nAtenção: nunca sacrifique a amplitude anatômica confortável para adicionar mais peso.',
        timestamp: time,
        category: 'biomechanics',
        actionButton: {
          label: 'Ver demonstrações no treino',
          actionType: 'navigate_workout'
        }
      };
    }

    if (textLower.includes('carlos') || textLower.includes('professor') || textLower.includes('instrutor')) {
      return {
        id: `leo_${Date.now()}`,
        sender: 'leo',
        text: 'O Prof. Carlos Silva (CREF 084920-G/SP) é o seu instrutor responsável na academia Viva Jardins. Posso encaminhar uma mensagem para a ficha técnica dele agora mesmo.',
        timestamp: time,
        category: 'instructor_referral',
        actionButton: {
          label: 'Encaminhar ao Prof. Carlos Silva',
          actionType: 'call_instructor'
        }
      };
    }

    if (textLower.includes('evolução') || textLower.includes('progresso') || textLower.includes('histórico') || textLower.includes('meta')) {
      return {
        id: `leo_${Date.now()}`,
        sender: 'leo',
        text: 'Sua consistência está exemplar neste ciclo! São 43 treinos concluídos e 14 dias seguidos na sua meta semanal.\n\nSua carga no Supino Inclinado progrediu de 20 kg para 24 kg com controle postural preservado.',
        timestamp: time,
        category: 'motivation',
        actionButton: {
          label: 'Ver histórico completo',
          actionType: 'navigate_workout',
          payload: 'history'
        }
      };
    }

    return {
      id: `leo_${Date.now()}`,
      sender: 'leo',
      text: 'Entendido, Carlos! Estou acompanhando seu treino em tempo real. Lembre-se de manter o movimento controlado e respeitar seus limites articulares.\n\nSe precisar de qualquer adaptação, é só me chamar!',
      timestamp: time,
      category: 'motivation'
    };
  }

  private getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const chatService = new ChatService();
