const text = (value) => String(value ?? '').trim();

export const CONTENT_TYPES = [
  {
    key: 'material',
    title: 'Materiais',
    endpoint: 'material',
    buildPayload: (item, courseId, userId) => ({
      titulo: text(item.titulo),
      subtitulo: text(item.subtitulo),
      conteudo: text(item.conteudo),
      links: (Array.isArray(item.links) ? item.links : []).filter((link) => link?.url).map((link) => ({ titulo: text(link.titulo) || 'Abrir link', url: text(link.url) })),
      usuario: { id: userId },
      curso: { id: courseId },
    }),
    getSummary: (item) => item.subtitulo || item.conteudo,
  },
  {
    key: 'exercicios',
    title: 'Exercicios', endpoint: 'exercicios', statusField: 'statusExercicios', defaultStatus: 'Nao concluido',
    buildPayload: (item, courseId, userId) => ({
      enunciado: text(item.enunciado),
      alternativas: (Array.isArray(item.alternativas) ? item.alternativas : []).map(text).filter(Boolean), respostaCorreta: text(item.respostaCorreta),
      explicacao: text(item.explicacao),
      usuario: { id: userId }, curso: { id: courseId }, statusExercicios: text(item.status) || 'Nao concluido',
    }),
    getSummary: (item) => item.enunciado || item.conteudo,
  },
];

export const createEmptyEntry = (typeKey) => typeKey === 'exercicios' ? ({ titulo: '', subtitulo: '', conteudo: '', enunciado: '', alternativas: ['', '', '', ''], respostaCorreta: '', explicacao: '', link: '', status: 'Nao concluido' }) : ({ titulo: '', subtitulo: '', conteudo: '', links: [], status: 'Nao concluido' });

export const getCourseContentCourseId = (item) => (
  item.cursoId ??
  item.curso_id ??
  item.idCurso ??
  item.curso?.id ??
  null
);

export const normalizeCourseContentItem = (typeKey, item) => ({
  id: item.id, titulo: item.titulo || '', subtitulo: item.subtitulo || '', conteudo: item.conteudo || '',
  enunciado: item.enunciado || item.conteudo || '', alternativas: Array.isArray(item.alternativas) ? item.alternativas : ['', '', '', ''],
  respostaCorreta: item.respostaCorreta || '', explicacao: item.explicacao || '', links: Array.isArray(item.links) ? item.links.map((link) => typeof link === 'string' ? ({ titulo: 'Abrir link', url: link }) : link) : [],
  status: item.statusMaterial || item.statusExercicios || 'Nao concluido', cursoId: getCourseContentCourseId(item),
});
