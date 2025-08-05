export const courses = {
  matematica: {
    name: 'Matemática',
    levels: {
      fundamental: {
        name: 'Ensino Fundamental',
        topics: [
          'Números e Operações',
          'Frações e Decimais',
          'Geometria Básica',
          'Medidas e Grandezas',
          'Álgebra Inicial',
          'Estatística e Probabilidade'
        ]
      },
      medio: {
        name: 'Ensino Médio',
        topics: [
          'Funções',
          'Geometria Analítica',
          'Trigonometria',
          'Logaritmos',
          'Progressões',
          'Análise Combinatória'
        ]
      }
    }
  },
  portugues: {
    name: 'Português',
    levels: {
      fundamental: {
        name: 'Ensino Fundamental',
        topics: [
          'Gramática Básica',
          'Ortografia e Acentuação',
          'Interpretação de Texto',
          'Produção Textual',
          'Literatura Infantojuvenil',
          'Comunicação e Linguagem'
        ]
      },
      medio: {
        name: 'Ensino Médio',
        topics: [
          'Literatura Brasileira',
          'Redação e Dissertação',
          'Análise Sintática',
          'Figuras de Linguagem',
          'Gêneros Textuais',
          'Gramática Avançada'
        ]
      }
    }
  }
};

export const teacherTasks = {
  matematica: {
    fundamental: [
      'Criar exercícios de operações básicas',
      'Desenvolver atividades com frações',
      'Propor problemas de geometria',
      'Elaborar questões de medidas',
      'Criar introdução à álgebra',
      'Desenvolver exercícios de estatística'
    ],
    medio: [
      'Criar gráficos de funções',
      'Desenvolver exercícios de geometria analítica',
      'Propor problemas trigonométricos',
      'Elaborar questões de logaritmos',
      'Criar sequências e progressões',
      'Desenvolver problemas combinatórios'
    ]
  },
  portugues: {
    fundamental: [
      'Criar exercícios gramaticais',
      'Desenvolver ditados e ortografia',
      'Propor textos para interpretação',
      'Elaborar temas para redação',
      'Criar atividades literárias',
      'Desenvolver exercícios de comunicação'
    ],
    medio: [
      'Criar análises literárias',
      'Desenvolver temas de dissertação',
      'Propor exercícios sintáticos',
      'Elaborar atividades estilísticas',
      'Criar análises textuais',
      'Desenvolver exercícios gramaticais avançados'
    ]
  }
};