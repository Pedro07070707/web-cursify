export const mockCourses = [
  {
    id: 1,
    title: 'Matemática Básica - Ensino Fundamental',
    description: 'Curso completo de matemática para ensino fundamental com exercícios práticos',
    instructor: 'Prof. João Silva',
    level: 'Fundamental',
    subject: 'Matemática',
    duration: '40 horas',
    enrolled: false,
    videos: [
      { id: 1, title: 'Números e Operações', duration: '15 min' },
      { id: 2, title: 'Frações', duration: '20 min' },
      { id: 3, title: 'Geometria Básica', duration: '18 min' }
    ]
  },
  {
    id: 2,
    title: 'Português - Literatura Brasileira',
    description: 'Explore os principais autores e movimentos da literatura brasileira',
    instructor: 'Prof. Maria Santos',
    level: 'Médio',
    subject: 'Português',
    duration: '35 horas',
    enrolled: false,
    videos: [
      { id: 1, title: 'Romantismo', duration: '25 min' },
      { id: 2, title: 'Realismo', duration: '22 min' },
      { id: 3, title: 'Modernismo', duration: '30 min' }
    ]
  },
  {
    id: 3,
    title: 'Matemática Avançada - Funções',
    description: 'Estudo completo de funções matemáticas para ensino médio',
    instructor: 'Prof. Carlos Lima',
    level: 'Médio',
    subject: 'Matemática',
    duration: '50 horas',
    enrolled: false,
    videos: [
      { id: 1, title: 'Função Linear', duration: '20 min' },
      { id: 2, title: 'Função Quadrática', duration: '25 min' },
      { id: 3, title: 'Função Exponencial', duration: '22 min' }
    ]
  }
];

export const mockChats = [
  {
    id: 1,
    studentName: 'Ana Costa',
    lastMessage: 'Tenho dúvidas sobre frações',
    timestamp: '10:30',
    unread: true
  },
  {
    id: 2,
    studentName: 'Pedro Oliveira',
    lastMessage: 'Obrigado pela explicação!',
    timestamp: '09:15',
    unread: false
  }
];