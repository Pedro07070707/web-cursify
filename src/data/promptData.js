export const promptUsers = [
  {
    id: 1,
    nome: 'Joao Silva',
    email: 'joao@cursify.com',
    senha: '123456',
    role: 'USUARIO',
    tipo: 'Aluno',
    ativo: true,
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@cursify.com',
    senha: '123456',
    role: 'PROFESSOR',
    tipo: 'Professor',
    ativo: true,
  },
  {
    id: 3,
    nome: 'Ana Oliveira',
    email: 'ana@cursify.com',
    senha: '123456',
    role: 'ADMIN',
    tipo: 'Admin',
    ativo: true,
  },
  {
    id: 4,
    nome: 'Pedro Costa',
    email: 'pedro@cursify.com',
    senha: '123456',
    role: 'USUARIO',
    tipo: 'Aluno',
    ativo: true,
  },
];

export const promptCategories = [
  { id: 1, nome: 'Ciencias Exatas', slug: 'ciencias-exatas' },
  { id: 2, nome: 'Linguagens', slug: 'linguagens' },
  { id: 3, nome: 'Tecnologia', slug: 'tecnologia' },
];

export const promptCourses = [
  {
    id: 1,
    titulo: 'Matematica Basica',
    slug: 'matematica-basica',
    categoria: 'Ciencias Exatas',
    nivel: 'INICIANTE',
    gratuito: true,
    publicado: true,
    professor: 'Maria Santos',
    avaliacao: 4.8,
    matriculados: 1240,
    cargaHorariaMinutos: 480,
    descricao: 'Fundamentos, exercicios e trilhas guiadas para consolidar calculo e raciocinio logico.',
    thumbnail: '/ImgCurso1.jpg',
    modulos: [
      {
        id: 11,
        titulo: 'Fundamentos',
        aulas: [
          { id: 111, titulo: 'Numeros e operacoes', tipo: 'VIDEO', duracao: 18 },
          { id: 112, titulo: 'Fracoes e decimais', tipo: 'TEXTO', duracao: 22 },
        ],
      },
      {
        id: 12,
        titulo: 'Aplicacoes',
        aulas: [
          { id: 121, titulo: 'Problemas do cotidiano', tipo: 'QUIZ', duracao: 20 },
          { id: 122, titulo: 'Geometria inicial', tipo: 'PDF', duracao: 24 },
        ],
      },
    ],
  },
  {
    id: 2,
    titulo: 'Escrita e Leitura',
    slug: 'escrita-e-leitura',
    categoria: 'Linguagens',
    nivel: 'INTERMEDIARIO',
    gratuito: false,
    publicado: true,
    professor: 'Maria Santos',
    avaliacao: 4.7,
    matriculados: 860,
    cargaHorariaMinutos: 360,
    descricao: 'Curso focado em interpretacao textual, redacao e producao de texto com feedback estruturado.',
    thumbnail: '/ImgCurso2.jpg',
    modulos: [
      {
        id: 21,
        titulo: 'Leitura critica',
        aulas: [
          { id: 211, titulo: 'Ideias principais', tipo: 'VIDEO', duracao: 14 },
          { id: 212, titulo: 'Inferencia textual', tipo: 'TEXTO', duracao: 18 },
        ],
      },
    ],
  },
  {
    id: 3,
    titulo: 'Programacao Para Todos',
    slug: 'programacao-para-todos',
    categoria: 'Tecnologia',
    nivel: 'AVANCADO',
    gratuito: true,
    publicado: false,
    professor: 'Maria Santos',
    avaliacao: 4.9,
    matriculados: 420,
    cargaHorariaMinutos: 540,
    descricao: 'Bases de logica, algoritmos, frontend e backend para trilhas tecnicas gamificadas.',
    thumbnail: '/ImgCurso3.jpg',
    modulos: [
      {
        id: 31,
        titulo: 'Primeiros passos',
        aulas: [
          { id: 311, titulo: 'Lógica', tipo: 'VIDEO', duracao: 16 },
          { id: 312, titulo: 'Estruturas de controle', tipo: 'QUIZ', duracao: 26 },
        ],
      },
    ],
  },
];

export const promptTracks = [
  {
    id: 1,
    titulo: 'Matematica Basica',
    materia: 'Ciencias Exatas',
    professor: 'Maria Santos',
    xpTotal: 900,
    dificuldade: 'Iniciante',
    thumbnail: '/carousel-1.jpg',
    progresso: 58,
    streak: 7,
    proximoNo: 'Fractions quiz',
    nos: [
      { id: 1, titulo: 'Numeros', tipo: 'LICAO', estado: 'CONCLUIDO', xp: 50, icone: 'book' },
      { id: 2, titulo: 'Operacoes', tipo: 'EXERCICIO', estado: 'CONCLUIDO', xp: 70, icone: 'pencil' },
      { id: 3, titulo: 'Fracoes', tipo: 'QUIZ', estado: 'EM_ANDAMENTO', xp: 90, icone: 'list-check', destaque: true },
      { id: 4, titulo: 'Medidas', tipo: 'CHECKPOINT', estado: 'LIBERADO', xp: 120, icone: 'star', checkpoint: true },
      { id: 5, titulo: 'Geometria', tipo: 'PROJETO', estado: 'BLOQUEADO', xp: 140, icone: 'clipboard' },
    ],
  },
  {
    id: 2,
    titulo: 'Escrita e Leitura',
    materia: 'Linguagens',
    professor: 'Maria Santos',
    xpTotal: 760,
    dificuldade: 'Intermediario',
    thumbnail: '/carousel-2.jpg',
    progresso: 34,
    streak: 3,
    proximoNo: 'Redacao guiada',
    nos: [
      { id: 21, titulo: 'Leitura critica', tipo: 'LICAO', estado: 'CONCLUIDO', xp: 40, icone: 'book' },
      { id: 22, titulo: 'Interpretação', tipo: 'EXERCICIO', estado: 'LIBERADO', xp: 60, icone: 'pencil' },
      { id: 23, titulo: 'Redacao', tipo: 'PROJETO', estado: 'BLOQUEADO', xp: 90, icone: 'clipboard' },
    ],
  },
];

export const promptNotifications = [
  { id: 1, titulo: 'Nova mensagem', mensagem: 'Maria respondeu na conversa de trilha', tipo: 'CHAT', lida: false, criadoEm: '08:30' },
  { id: 2, titulo: 'Curso liberado', mensagem: 'Matematica Basica foi publicada', tipo: 'CURSO', lida: true, criadoEm: 'Ontem' },
  { id: 3, titulo: 'Streak mantida', mensagem: 'Voce estudou por 7 dias seguidos', tipo: 'SISTEMA', lida: false, criadoEm: 'Agora' },
];

export const promptConversations = [
  {
    id: 100,
    nome: 'Grupo da trilha de matematica',
    status: 'online',
    tipo: 'GRUPO',
    unread: 2,
    preview: 'Vamos fechar o checkpoint hoje?',
    time: '10:40',
    participants: [1, 2, 4],
    messages: [
      { id: 1, authorId: 2, author: 'Maria Santos', text: 'Vamos fechar o checkpoint hoje?', time: '10:40', own: false },
      { id: 2, authorId: 1, author: 'Joao Silva', text: 'Estou pronto para a ultima etapa.', time: '10:41', own: true },
    ],
  },
  {
    id: 101,
    nome: 'Joao Silva',
    status: 'online',
    tipo: 'DIRETO',
    unread: 0,
    preview: 'Obrigada pelo feedback.',
    time: '09:12',
    participants: [1, 2],
    messages: [
      { id: 1, authorId: 1, author: 'Joao Silva', text: 'Tenho duvida sobre fractions.', time: '09:05', own: true },
      { id: 2, authorId: 2, author: 'Maria Santos', text: 'Veja o nodo 3 e responda o quiz novamente.', time: '09:12', own: false },
    ],
  },
];

export const promptAchievements = [
  { id: 1, titulo: 'Primeiro passo', descricao: 'Concluir a primeira licao', desbloqueada: true },
  { id: 2, titulo: 'Ritmo constante', descricao: 'Manter streak de 7 dias', desbloqueada: true },
  { id: 3, titulo: 'Matematico', descricao: 'Ganhar 500 XP', desbloqueada: false },
  { id: 4, titulo: 'Conversa ativa', descricao: 'Enviar 20 mensagens', desbloqueada: false },
  { id: 5, titulo: 'Explorador', descricao: 'Concluir 3 trilhas', desbloqueada: false },
];

export const promptStats = {
  xpTotal: 680,
  level: 4,
  streak: 7,
  streakMax: 12,
  coursesInProgress: 2,
  tracksInProgress: 2,
  certificates: 3,
  recommendations: ['Matematica Basica', 'Escrita e Leitura', 'Programacao Para Todos'],
};

