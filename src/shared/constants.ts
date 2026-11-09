import { UserProfile } from '../models/user.model';
import { WorkoutSession } from '../models/workout.model';
import { HistoryStats, PastWorkoutLog } from '../models/history.model';
import { SuggestedPrompt } from '../models/chat.model';

export const LEO_ASSET_IMAGE = '/assets/leo/image_c0f82582.png';
export const LEO_OFFICIAL_AVATAR = '/assets/leo/l_o-perfil_6168415a.png';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_carlos_mendes_01',
  name: 'Carlos Eduardo Mendes',
  email: 'carlos.mendes@email.com',
  phone: '(11) 98452-1920',
  memberSince: 'Membro desde Julho 2025',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  verified: true,
  gymName: 'Academia Viva',
  gymBranch: 'Unidade Jardins',
  gymAffiliationStatus: 'Ativo',
  instructorName: 'Prof. Carlos Silva',
  instructorCref: 'CREF 084920-G/SP',
  age: 48,
  weightKg: 81.5,
  heightCm: 178,
  weeklyFrequency: 4,
  trainingDays: ['Seg', 'Ter', 'Qui', 'Sex'],
  experienceLevel: 'Intermediário',
  experienceDetail: '1 ano e meio',
  primaryGoal: 'Hipertrofia & Força Funcional',
  availability: 'Seg, Ter, Qui e Sex (manhãs, ~60 min)',
  biomechanicalFocus: 'Preservação articular de ombros e lombar',
  activeLimitations: [
    'Desconforto leve no Supino',
    'Adaptação barra para halteres',
  ],
  additionalNotes:
    'Histórico prévio de tendinite no ombro direito. Priorizar pegada neutra e aquecimento de manguito rotador.',
  leoPreferences: {
    voiceTone: 'Motivador, técnico e empático',
    restReminders: true,
    restDurationSeconds: 60,
    customRestSeconds: 60,
    guidanceDetail: 'Foco prático e postura correta',
    audioFeedbackEnabled: true,
  },
  accountSettings: {
    pushNotifications: true,
    privacyInstructorShared: true,
    offlineSync: true,
    soundEffects: true,
  },
  sharingSettings: {
    recentWorkouts: true,
    exercisesAndWeights: true,
    evolutionMetrics: true,
    limitationsAndNotes: true,
    duration: 'continuous',
  },
  notificationCategories: {
    workoutReminders: true,
    restReminders: true,
    leoMessages: true,
    instructorNotices: true,
  },
  instructorMessages: [
    {
      id: 'msg_01',
      date: '20 de Outubro • 14:10',
      topic: 'Desconforto Articular',
      message:
        'Professor, senti um leve estalo no ombro durante a subida da última série do supino inclinado. O LÉO sugeriu converter para halteres com pegada neutra.',
      attachedData: [
        'Treino A (Peito & Ombros)',
        'Carga: 22kg',
        'Restrição: Ombro direito',
      ],
      status: 'respondida',
      reply: {
        text: 'Excelente conduta, Carlos! Mantenha os halteres com pegada neutra e cotovelos em 45°. Revisei sua ficha e reduzi a inclinação do banco para 30°. Vamos avaliar na próxima semana.',
        date: '20 de Outubro • 16:30',
      },
    },
    {
      id: 'msg_02',
      date: 'Ontem • 18:20',
      topic: 'Revisão de Biometria',
      message:
        'Olá Carlos, completei 14 treinos consistentes no mês. Gostaria de agendar a reavaliação de bioimpedância para ajustar a meta de carga do próximo ciclo.',
      attachedData: ['Relatório de Consistência (14 dias)', 'Ritmo: 4x/semana'],
      status: 'aguardando',
    },
  ],
};

export const INITIAL_WORKOUTS: WorkoutSession[] = [
  {
    id: 'wo_treino_a',
    code: 'Treino A',
    title: 'Peito, Tríceps & Ombro',
    focusMuscles: ['Peitoral', 'Tríceps', 'Deltóide Anterior/Lateral'],
    estimatedDurationMin: 52,
    intensity: 'Alta',
    maxWeightLabel: 'Carga máx. 24kg',
    exercises: [
      {
        id: 'ex_1',
        name: 'Supino Inclinado com Halteres',
        muscleGroup: 'Peitoral Superior',
        targetArea: 'Tórax e ombros',
        previousPerformance: '22 kg × 12 reps',
        sets: [
          { setNumber: 1, repsTarget: '12', weightKg: 20, completed: true },
          { setNumber: 2, repsTarget: '10', weightKg: 22, completed: true },
          { setNumber: 3, repsTarget: '10', weightKg: 24, completed: true },
          { setNumber: 4, repsTarget: '8', weightKg: 24, completed: false },
        ],
        defaultRestSeconds: 60,
        leoTip:
          'Mantenha os cotovelos a ~45° do tronco para proteger os ombros. Não encoste os halteres no topo!',
        postureTip: {
          execution:
            'Mantenha os cotovelos a ~45° do tronco e as escápulas aduzidas no encosto.',
          avoidError:
            'Não hiperestenda os punhos nem deixe os halteres colidirem no topo.',
          breathing:
            'Inspire na descida lenta (3s) e expire com potência ao empurrar.',
        },
        alternatives: [
          {
            name: 'Supino Reto com Halteres e Pegada Neutra',
            reason: 'Menor estresse na articulação glenoumeral.',
            equipment: 'Banco reto + Halteres',
            focus: 'Peitoral Geral',
          },
          {
            name: 'Chest Press na Máquina Articulada',
            reason: 'Trajetória guiada e maior segurança na carga.',
            equipment: 'Máquina Chest Press',
            focus: 'Peitoral Médio',
          },
        ],
        completed: false,
      },
      {
        id: 'ex_2',
        name: 'Crucifixo no Banco Inclinado',
        muscleGroup: 'Peitoral Superior',
        targetArea: 'Alongamento miofascial',
        previousPerformance: '14 kg × 12 reps',
        sets: [
          { setNumber: 1, repsTarget: '12', weightKg: 14, completed: true },
          { setNumber: 2, repsTarget: '12', weightKg: 14, completed: true },
          { setNumber: 3, repsTarget: '10', weightKg: 16, completed: false },
        ],
        defaultRestSeconds: 60,
        leoTip:
          'Cotovelos levemente flexionados durante todo o arco. Controle a descida em 3 segundos.',
        postureTip: {
          execution:
            'Mantenha cotovelos em arco fixo (semiflexionados) durante toda a amplitude.',
          avoidError:
            'Não desça abaixo da linha dos ombros para preservar a cápsula articular anterior.',
          breathing:
            'Inspire na abertura torácica e expire ao aproximar os pesos acima do peitoral.',
        },
        alternatives: [
          {
            name: 'Crucifixo no Crossover com Polia Média',
            reason: 'Tensão constante em todo o arco de movimento.',
            equipment: 'Polia dupla',
            focus: 'Peitoral',
          },
          {
            name: 'Voador / Peck Deck',
            reason: 'Sem carga axial nos punhos e rotação controlada.',
            equipment: 'Aparelho Peck Deck',
            focus: 'Peitoral',
          },
        ],
        completed: false,
      },
      {
        id: 'ex_3',
        name: 'Elevação Lateral com Halteres',
        muscleGroup: 'Deltóide Lateral',
        targetArea: 'Largura dos ombros',
        previousPerformance: '10 kg × 15 reps',
        sets: [
          { setNumber: 1, repsTarget: '15', weightKg: 10, completed: true },
          { setNumber: 2, repsTarget: '12', weightKg: 12, completed: false },
          { setNumber: 3, repsTarget: '12', weightKg: 12, completed: false },
        ],
        defaultRestSeconds: 45,
        leoTip:
          'Polegares levemente apontados para baixo como se despejasse água de uma jarra. Escápulas travadas!',
        postureTip: {
          execution:
            'Eleve os halteres até a linha dos ombros no plano escapular (~30° à frente).',
          avoidError:
            'Evite balanço do tronco com impulso lombar e não encolha o trapézio.',
          breathing:
            'Expire na subida lateral e inspire no retorno controlado em 2 segundos.',
        },
        alternatives: [
          {
            name: 'Elevação Lateral na Polia Baixa',
            reason: 'Resistência contínua desde a posição inicial.',
            equipment: 'Polia baixa',
            focus: 'Deltóide Lateral',
          },
        ],
        completed: false,
      },
      {
        id: 'ex_4',
        name: 'Desenvolvimento com Halteres no Banco 75°',
        muscleGroup: 'Deltóide Anterior',
        targetArea: 'Ombros e empurrar',
        previousPerformance: '16 kg × 10 reps',
        sets: [
          { setNumber: 1, repsTarget: '10', weightKg: 16, completed: false },
          { setNumber: 2, repsTarget: '10', weightKg: 18, completed: false },
          { setNumber: 3, repsTarget: '8', weightKg: 18, completed: false },
        ],
        defaultRestSeconds: 60,
        leoTip:
          'Banco a 75° alivia a compressão subacromial comparado ao banco 90°. Pegada semi-neutra.',
        postureTip: {
          execution:
            'Banco a 75° com pegada semi-neutra; empurre em linha reta sem estalar cotovelos.',
          avoidError:
            'Não arqueie a região lombar descolando as costas do encosto.',
          breathing:
            'Inspire descendo até a altura dos queixo/orelhas e expire subindo.',
        },
        alternatives: [
          {
            name: 'Desenvolvimento Máquina Hammer',
            reason: 'Pegada neutra anatômica e empunhadura ergonômica.',
            equipment: 'Máquina Shoulder Press',
            focus: 'Ombros',
          },
        ],
        completed: false,
      },
      {
        id: 'ex_5',
        name: 'Tríceps Corda na Polia Alta',
        muscleGroup: 'Tríceps Braquial',
        targetArea: 'Cabeça lateral do tríceps',
        previousPerformance: '25 kg × 15 reps',
        sets: [
          { setNumber: 1, repsTarget: '15', weightKg: 25, completed: false },
          { setNumber: 2, repsTarget: '12', weightKg: 30, completed: false },
          { setNumber: 3, repsTarget: '10', weightKg: 30, completed: false },
        ],
        defaultRestSeconds: 45,
        leoTip:
          'Abra a corda ao final da extensão máxima e aperte o tríceps por 1 segundo!',
        postureTip: {
          execution:
            'Cotovelos fixos ao lado do tronco; abra a ponta das cordas ao estender os braços.',
          avoidError:
            'Não balance o tronco nem projete os ombros para frente durante a extensão.',
          breathing:
            'Expire estendendo os cotovelos e inspire voltando até 90°.',
        },
        alternatives: [
          {
            name: 'Tríceps Barra W na Polia',
            reason: 'Mais estabilidade para progressão de carga.',
            equipment: 'Polia alta',
            focus: 'Tríceps',
          },
        ],
        completed: false,
      },
      {
        id: 'ex_6',
        name: 'Tríceps Francês Unilateral com Halter',
        muscleGroup: 'Tríceps Braquial',
        targetArea: 'Cabeça longa do tríceps',
        previousPerformance: '9 kg × 12 reps',
        sets: [
          { setNumber: 1, repsTarget: '12', weightKg: 9, completed: false },
          { setNumber: 2, repsTarget: '12', weightKg: 9, completed: false },
          { setNumber: 3, repsTarget: '10', weightKg: 10, completed: false },
        ],
        defaultRestSeconds: 45,
        leoTip:
          'Mantenha o braço próximo à orelha e controle o cotovelo sem oscilar o ombro.',
        postureTip: {
          execution:
            'Braço perpendicular ao chão, próximo à cabeça; flexione apenas o antebraço.',
          avoidError:
            'Não permita que o cotovelo abra para a lateral ou oscile na subida.',
          breathing:
            'Inspire descendo o halter atrás da cabeça e expire ao estender para cima.',
        },
        alternatives: [
          {
            name: 'Tríceps Testa com Halteres',
            reason: 'Excelente alongamento sob controle no banco.',
            equipment: 'Banco reto',
            focus: 'Cabeça longa',
          },
        ],
        completed: false,
      },
    ],
  },
  {
    id: 'wo_treino_b',
    code: 'Treino B',
    title: 'Costas & Bíceps',
    focusMuscles: ['Dorsais', 'Trapézio', 'Bíceps', 'Antebraço'],
    estimatedDurationMin: 47,
    intensity: 'Alta',
    maxWeightLabel: 'Puxada 50kg',
    exercises: [
      {
        id: 'ex_b1',
        name: 'Puxada Alta Frontal na Polia',
        muscleGroup: 'Dorsal e Redondo Maior',
        targetArea: 'Costas largura',
        sets: [
          { setNumber: 1, repsTarget: '12', weightKg: 45, completed: true },
          { setNumber: 2, repsTarget: '10', weightKg: 50, completed: true },
          { setNumber: 3, repsTarget: '8', weightKg: 50, completed: true },
        ],
        defaultRestSeconds: 60,
        leoTip:
          'Puxe com os cotovelos em direção aos bolsos da calça, peito estufado.',
        alternatives: [],
        completed: true,
      },
      {
        id: 'ex_b2',
        name: 'Remada Baixa Sentada no Triângulo',
        muscleGroup: 'Dorsal Médio e Rombóides',
        targetArea: 'Espessura de costas',
        sets: [
          { setNumber: 1, repsTarget: '12', weightKg: 40, completed: true },
          { setNumber: 2, repsTarget: '10', weightKg: 45, completed: true },
          { setNumber: 3, repsTarget: '8', weightKg: 50, completed: true },
        ],
        defaultRestSeconds: 60,
        leoTip:
          'Mantenha a curvatura lombar anatômica e aperte as escápulas no final.',
        alternatives: [],
        completed: true,
      },
      {
        id: 'ex_b3',
        name: 'Rosca Direta com Halteres e Pegada Supinada',
        muscleGroup: 'Bíceps Braquial',
        targetArea: 'Pico de bíceps',
        sets: [
          { setNumber: 1, repsTarget: '12', weightKg: 12, completed: true },
          { setNumber: 2, repsTarget: '10', weightKg: 14, completed: true },
          { setNumber: 3, repsTarget: '8', weightKg: 14, completed: true },
        ],
        defaultRestSeconds: 45,
        leoTip: 'Gire o punho na subida para ativação completa do bíceps.',
        alternatives: [],
        completed: true,
      },
    ],
  },
  {
    id: 'wo_treino_c',
    code: 'Treino C',
    title: 'Pernas & Panturrilhas',
    focusMuscles: ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas'],
    estimatedDurationMin: 58,
    intensity: 'Intensa',
    maxWeightLabel: 'Leg press 160kg',
    exercises: [
      {
        id: 'ex_c1',
        name: 'Leg Press 45°',
        muscleGroup: 'Quadríceps e Glúteos',
        targetArea: 'Membros inferiores completo',
        sets: [
          { setNumber: 1, repsTarget: '15', weightKg: 120, completed: true },
          { setNumber: 2, repsTarget: '12', weightKg: 140, completed: true },
          { setNumber: 3, repsTarget: '10', weightKg: 160, completed: true },
        ],
        defaultRestSeconds: 75,
        leoTip:
          'Não trave os joelhos no topo! Mantenha a lombar 100% apoiada no encosto.',
        alternatives: [],
        completed: true,
      },
      {
        id: 'ex_c2',
        name: 'Cadeira Extensora',
        muscleGroup: 'Quadríceps',
        targetArea: 'Foco reto femoral',
        sets: [
          { setNumber: 1, repsTarget: '15', weightKg: 45, completed: true },
          { setNumber: 2, repsTarget: '12', weightKg: 50, completed: true },
          { setNumber: 3, repsTarget: '10', weightKg: 55, completed: true },
        ],
        defaultRestSeconds: 60,
        leoTip: 'Pausa isométrica de 1 segundo no pico de contração.',
        alternatives: [],
        completed: true,
      },
    ],
  },
];

export const INITIAL_HISTORY_STATS: HistoryStats = {
  totalWorkouts: 43,
  weeklyPace: '4x',
  activeStreakDays: 14,
  completionRatePercent: 96,
  focusIncreasePercent: 18,
};

export const INITIAL_PAST_WORKOUTS: PastWorkoutLog[] = [
  {
    id: 'past_1',
    workoutCode: 'Treino A',
    title: 'Treino A — Peito, Tríceps & Ombro',
    dateFormatted: 'Hoje, 27 de Outubro • 07:30',
    dateKey: '2026-10-27',
    durationMin: 52,
    exerciseCount: 6,
    maxStatLabel: 'Carga máx. 24kg',
    status: 'Concluído',
    feedbackNotes:
      'Pegada neutra e retração escapular mantidas com sucesso. Sem relato de dor no ombro direito.',
    exercises: [
      {
        name: 'Supino Inclinado com Halteres',
        muscleGroup: 'Peitoral Superior',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 20 },
          { setNumber: 2, reps: '10 reps', weightKg: 22 },
          { setNumber: 3, reps: '10 reps', weightKg: 24 },
          { setNumber: 4, reps: '8 reps', weightKg: 24 },
        ],
      },
      {
        name: 'Crucifixo no Banco Inclinado',
        muscleGroup: 'Peitoral Superior',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 14 },
          { setNumber: 2, reps: '12 reps', weightKg: 14 },
          { setNumber: 3, reps: '10 reps', weightKg: 16 },
        ],
      },
      {
        name: 'Elevação Lateral com Halteres',
        muscleGroup: 'Deltóide Lateral',
        sets: [
          { setNumber: 1, reps: '15 reps', weightKg: 10 },
          { setNumber: 2, reps: '12 reps', weightKg: 12 },
          { setNumber: 3, reps: '12 reps', weightKg: 12 },
        ],
      },
      {
        name: 'Desenvolvimento com Halteres no Banco 75°',
        muscleGroup: 'Deltóide Anterior',
        sets: [
          { setNumber: 1, reps: '10 reps', weightKg: 16 },
          { setNumber: 2, reps: '10 reps', weightKg: 18 },
          { setNumber: 3, reps: '8 reps', weightKg: 18 },
        ],
      },
      {
        name: 'Tríceps Corda na Polia Alta',
        muscleGroup: 'Tríceps Braquial',
        sets: [
          { setNumber: 1, reps: '15 reps', weightKg: 25 },
          { setNumber: 2, reps: '12 reps', weightKg: 30 },
          { setNumber: 3, reps: '10 reps', weightKg: 30 },
        ],
      },
      {
        name: 'Tríceps Francês Unilateral com Halter',
        muscleGroup: 'Tríceps Braquial',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 9 },
          { setNumber: 2, reps: '12 reps', weightKg: 9 },
          { setNumber: 3, reps: '10 reps', weightKg: 10 },
        ],
      },
    ],
  },
  {
    id: 'past_2',
    workoutCode: 'Treino C',
    title: 'Treino C — Pernas & Panturrilhas',
    dateFormatted: 'Sexta, 25 de Outubro • 18:45',
    dateKey: '2026-10-25',
    durationMin: 58,
    exerciseCount: 7,
    maxStatLabel: 'Leg press 160kg',
    status: 'Concluído',
    feedbackNotes:
      'Cadência de 3s excêntrica preservada no Leg Press. Boa recuperação entre as séries.',
    exercises: [
      {
        name: 'Leg Press 45°',
        muscleGroup: 'Quadríceps e Glúteos',
        sets: [
          { setNumber: 1, reps: '15 reps', weightKg: 120 },
          { setNumber: 2, reps: '12 reps', weightKg: 140 },
          { setNumber: 3, reps: '10 reps', weightKg: 160 },
        ],
      },
      {
        name: 'Cadeira Extensora',
        muscleGroup: 'Quadríceps',
        sets: [
          { setNumber: 1, reps: '15 reps', weightKg: 45 },
          { setNumber: 2, reps: '12 reps', weightKg: 50 },
          { setNumber: 3, reps: '10 reps', weightKg: 55 },
        ],
      },
      {
        name: 'Mesa Flexora Deitada',
        muscleGroup: 'Isquiotibiais',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 35 },
          { setNumber: 2, reps: '10 reps', weightKg: 40 },
          { setNumber: 3, reps: '8 reps', weightKg: 45 },
        ],
      },
      {
        name: 'Panturrilha no Smith',
        muscleGroup: 'Gastrocnêmio e Sóleo',
        sets: [
          { setNumber: 1, reps: '20 reps', weightKg: 60 },
          { setNumber: 2, reps: '15 reps', weightKg: 70 },
          { setNumber: 3, reps: '15 reps', weightKg: 70 },
          { setNumber: 4, reps: '12 reps', weightKg: 80 },
        ],
      },
    ],
  },
  {
    id: 'past_3',
    workoutCode: 'Treino B',
    title: 'Treino B — Costas & Bíceps',
    dateFormatted: 'Quarta, 23 de Outubro • 08:15',
    dateKey: '2026-10-23',
    durationMin: 47,
    exerciseCount: 6,
    maxStatLabel: 'Puxada 50kg',
    status: 'Concluído',
    feedbackNotes:
      'Foco na ativação de dorsais com cotovelos guiando a trajetória. Coluna lombar neutra.',
    exercises: [
      {
        name: 'Puxada Alta Frontal na Polia',
        muscleGroup: 'Dorsal e Redondo Maior',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 45 },
          { setNumber: 2, reps: '10 reps', weightKg: 50 },
          { setNumber: 3, reps: '8 reps', weightKg: 50 },
        ],
      },
      {
        name: 'Remada Baixa Sentada no Triângulo',
        muscleGroup: 'Dorsal Médio e Rombóides',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 40 },
          { setNumber: 2, reps: '10 reps', weightKg: 45 },
          { setNumber: 3, reps: '8 reps', weightKg: 50 },
        ],
      },
      {
        name: 'Rosca Direta com Halteres e Pegada Supinada',
        muscleGroup: 'Bíceps Braquial',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 12 },
          { setNumber: 2, reps: '10 reps', weightKg: 14 },
          { setNumber: 3, reps: '8 reps', weightKg: 14 },
        ],
      },
    ],
  },
  {
    id: 'past_4',
    workoutCode: 'Treino A',
    title: 'Treino A — Peito & Deltoide',
    dateFormatted: 'Segunda, 21 de Outubro • 07:40',
    dateKey: '2026-10-21',
    durationMin: 50,
    exerciseCount: 6,
    maxStatLabel: 'Carga máx. 22kg',
    status: 'Concluído',
    feedbackNotes:
      'Adaptação para halteres no supino com excelente estabilização articular.',
    exercises: [
      {
        name: 'Supino Inclinado com Halteres',
        muscleGroup: 'Peitoral Superior',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 18 },
          { setNumber: 2, reps: '10 reps', weightKg: 20 },
          { setNumber: 3, reps: '10 reps', weightKg: 22 },
          { setNumber: 4, reps: '8 reps', weightKg: 22 },
        ],
      },
      {
        name: 'Elevação Lateral com Halteres',
        muscleGroup: 'Deltóide Lateral',
        sets: [
          { setNumber: 1, reps: '15 reps', weightKg: 10 },
          { setNumber: 2, reps: '12 reps', weightKg: 10 },
          { setNumber: 3, reps: '10 reps', weightKg: 12 },
        ],
      },
    ],
  },
  {
    id: 'past_5',
    workoutCode: 'Treino C',
    title: 'Treino C — Pernas & Panturrilhas',
    dateFormatted: 'Sábado, 19 de Outubro • 09:00',
    dateKey: '2026-10-19',
    durationMin: 55,
    exerciseCount: 6,
    maxStatLabel: 'Leg press 150kg',
    status: 'Concluído',
    feedbackNotes:
      'Treino matinal de fim de semana com excelente volume total.',
    exercises: [
      {
        name: 'Leg Press 45°',
        muscleGroup: 'Quadríceps e Glúteos',
        sets: [
          { setNumber: 1, reps: '15 reps', weightKg: 120 },
          { setNumber: 2, reps: '12 reps', weightKg: 130 },
          { setNumber: 3, reps: '10 reps', weightKg: 150 },
        ],
      },
    ],
  },
  {
    id: 'past_6',
    workoutCode: 'Treino B',
    title: 'Treino B — Costas & Bíceps',
    dateFormatted: 'Quinta, 17 de Outubro • 18:30',
    dateKey: '2026-10-17',
    durationMin: 45,
    exerciseCount: 6,
    maxStatLabel: 'Puxada 45kg',
    status: 'Concluído',
    feedbackNotes: 'Progressão gradual de carga com controle de postura.',
    exercises: [
      {
        name: 'Puxada Alta Frontal na Polia',
        muscleGroup: 'Dorsal e Redondo Maior',
        sets: [
          { setNumber: 1, reps: '12 reps', weightKg: 40 },
          { setNumber: 2, reps: '10 reps', weightKg: 45 },
          { setNumber: 3, reps: '8 reps', weightKg: 45 },
        ],
      },
    ],
  },
];

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: 'p1', text: 'Adaptar meu exercício', category: 'biomechanics' },
  { id: 'p2', text: 'Melhorar minha postura', category: 'posture' },
  { id: 'p3', text: 'Ver alternativas', category: 'swap' },
  { id: 'p4', text: 'Consultar meu progresso', category: 'progress' },
  { id: 'p5', text: 'Falar com o instrutor', category: 'instructor' },
];
