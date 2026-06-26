export const CONTENT_TYPES = [
  {
    key: 'material',
    title: 'Materiais',
    endpoint: 'material',
    statusField: 'statusMaterial',
    defaultStatus: 'Nao concluido',
    buildPayload: (item, courseId, userId, _index, refs = {}) => ({
      titulo: item.titulo.trim(),
      subtitulo: item.subtitulo.trim(),
      conteudo: item.conteudo.trim(),
      link: item.link.trim(),
      usuario: { id: userId },
      curso: { id: courseId },
      statusMaterial: item.status || 'Nao concluido',
    }),
    getSummary: (item) => item.subtitulo || item.conteudo,
  },
  {
    key: 'exercicios',
    title: 'Exercicios',
    endpoint: 'exercicios',
    statusField: 'statusExercicios',
    defaultStatus: 'Nao concluido',
    buildPayload: (item, courseId, userId, _index, refs = {}) => ({
      titulo: item.titulo.trim(),
      subtitulo: item.subtitulo.trim(),
      conteudo: item.conteudo.trim(),
      link: item.link.trim(),
      usuario: { id: userId },
      curso: { id: courseId },
      statusExercicios: item.status || 'Nao concluido',
    }),
    getSummary: (item) => item.subtitulo || item.conteudo,
  },
];

export const createEmptyEntry = (typeKey) => {
  if (typeKey === 'atividades') {
    return {
      enunciado: '',
      alternativa: '',
      status: 0,
    };
  }

  return {
    titulo: '',
    subtitulo: '',
    conteudo: '',
    link: '',
    status: 'Nao concluido',
  };
};

export const getCourseContentCourseId = (item) => (
  item.cursoId ??
  item.curso_id ??
  item.idCurso ??
  item.curso?.id ??
  null
);

export const normalizeCourseContentItem = (typeKey, item) => {
  if (typeKey === 'atividades') {
    return {
      id: item.id,
      enunciado: item.enunciadoAtividade || '',
      alternativa: item.alternativaAtividade || '',
      status: item.statusAtividade ?? 0,
      cursoId: getCourseContentCourseId(item),
    };
  }

  if (typeKey === 'avaliacoes') {
    return {
      id: item.id,
      enunciado: item.enunciadoAvaliacao || '',
      alternativa: item.alternativaAvaliacao || '',
      status: item.statusAvaliacao ?? 0,
      cursoId: getCourseContentCourseId(item),
    };
  }

  return {
    id: item.id,
    titulo: item.titulo || '',
    subtitulo: item.subtitulo || '',
    conteudo: item.conteudo || '',
    link: item.link || '',
    status: item.statusMaterial || item.statusExercicios || 'Nao concluido',
    cursoId: getCourseContentCourseId(item),
  };
};
