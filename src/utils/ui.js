export const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

export const normalizeRole = (nivelAcesso) => String(nivelAcesso || '').toUpperCase();

export const isAdminRole = (nivelAcesso) => normalizeRole(nivelAcesso) === 'ADMIN';
export const isTeacherRole = (nivelAcesso) => {
  const role = normalizeRole(nivelAcesso);
  return role === 'PROFESSOR' || role === 'TEACHER';
};
export const isStudentRole = (nivelAcesso) => {
  const role = normalizeRole(nivelAcesso);
  return role === 'ALUNO' || role === 'ESTUDANTE' || role === 'STUDENT';
};

export const getUserRoleLabel = (nivelAcesso) => {
  if (isTeacherRole(nivelAcesso)) return 'Professor';
  if (isAdminRole(nivelAcesso)) return 'Administrador';
  return 'Aluno';
};

export const getDashboardPathByRole = (nivelAcesso) => {
  if (isTeacherRole(nivelAcesso)) return '/teacher';
  if (isAdminRole(nivelAcesso)) return '/admin';
  return '/student';
};

export const getCourseStatusLabel = (status) => {
  const normalizedStatus = String(status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (status === true || status === 'Ativo') return 'Ativo';
  if (status === false || status === 'Inativo') return 'Inativo';
  if (normalizedStatus.trim() === 'Concluido') return 'Concluido';
  return status || 'Nao informado';
};

export const formatCourseDuration = (course) => course.duracao || `${course.cargaHoraria} horas`;

export const buildSearchResults = (courses, term) => {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return {
      courses: [],
    };
  }

  const filteredCourses = courses.filter((course) => (
    `${course.nome || course.titulo || ''} ${course.descricao || ''}`.toLowerCase().includes(normalizedTerm)
  ));

  return {
    courses: filteredCourses,
  };
};
