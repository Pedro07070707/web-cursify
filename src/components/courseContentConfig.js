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
      usuarioId: userId,
      idUsuario: userId,
      usuario_id: userId,
      usuario: refs.user || { id: userId },
      cursoId: courseId,
      idCurso: courseId,
      curso_id: courseId,
      curso: refs.course || { id: courseId },
      statusMaterial: item.status || 'Nao concluido',
      status_material: item.status || 'Nao concluido',
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
      usuarioId: userId,
      idUsuario: userId,
      usuario_id: userId,
      usuario: refs.user || { id: userId },
      cursoId: courseId,
      idCurso: courseId,
      curso_id: courseId,
      curso: refs.course || { id: courseId },
      statusExercicios: item.status || 'Nao concluido',
      status_exercicios: item.status || 'Nao concluido',
    }),
    getSummary: (item) => item.subtitulo || item.conteudo,
  },
  {
    key: 'atividades',
    title: 'Atividades',
    endpoint: 'atividades',
    statusField: 'statusAtividade',
    defaultStatus: 0,
    buildPayload: (item, courseId, userId, index, refs = {}) => ({
      numeroAtividade: index + 1,
      numero_atividade: index + 1,
      enunciadoAtividade: item.enunciado.trim(),
      enunciado_atividade: item.enunciado.trim(),
      alternativaAtividade: item.alternativa.trim(),
      alternativa_atividade: item.alternativa.trim(),
      usuarioId: userId,
      idUsuario: userId,
      usuario_id: userId,
      usuario: refs.user || { id: userId },
      cursoId: courseId,
      idCurso: courseId,
      curso_id: courseId,
      curso: refs.course || { id: courseId },
      statusAtividade: Number(item.status) || 0,
      status_atividade: Number(item.status) || 0,
    }),
    getSummary: (item) => item.alternativa,
  },
  {
    key: 'avaliacoes',
    title: 'Avaliacoes',
    endpoint: 'avaliacao',
    statusField: 'statusAvaliacao',
    defaultStatus: 0,
    buildPayload: (item, courseId, userId, index, refs = {}) => ({
      numeroAvaliacao: index + 1,
      numero_avaliacao: index + 1,
      enunciadoAvaliacao: item.enunciado.trim(),
      enunciado_avaliacao: item.enunciado.trim(),
      alternativaAvaliacao: item.alternativa.trim(),
      alternativa_avaliacao: item.alternativa.trim(),
      usuarioId: userId,
      idUsuario: userId,
      usuario_id: userId,
      usuario: refs.user || { id: userId },
      cursoId: courseId,
      idCurso: courseId,
      curso_id: courseId,
      curso: refs.course || { id: courseId },
      statusAvaliacao: Number(item.status) || 0,
      status_avaliacao: Number(item.status) || 0,
    }),
    getSummary: (item) => item.alternativa,
  },
];

export const createEmptyEntry = (typeKey) => {
  if (typeKey === 'atividades' || typeKey === 'avaliacoes') {
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
