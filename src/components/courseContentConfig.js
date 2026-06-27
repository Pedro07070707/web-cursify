export const CONTENT_TYPES = [
  {
    key: 'material',
    title: 'Materiais',
    endpoint: 'material',
    statusField: 'statusMaterial',
    defaultStatus: 'Nao concluido',
    buildPayload: (item, courseId, userId) => ({
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
    buildPayload: (item, courseId, userId) => ({
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

export const createEmptyEntry = () => ({
  titulo: '',
  subtitulo: '',
  conteudo: '',
  link: '',
  status: 'Nao concluido',
});

export const getCourseContentCourseId = (item) => (
  item.cursoId ??
  item.curso_id ??
  item.idCurso ??
  item.curso?.id ??
  null
);

export const normalizeCourseContentItem = (typeKey, item) => ({
  id: item.id,
  titulo: item.titulo || '',
  subtitulo: item.subtitulo || '',
  conteudo: item.conteudo || '',
  link: item.link || '',
  status: item.statusMaterial || item.statusExercicios || 'Nao concluido',
  cursoId: getCourseContentCourseId(item),
});
