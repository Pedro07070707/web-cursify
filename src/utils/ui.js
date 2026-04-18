export const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

export const getUserRoleLabel = (nivelAcesso) => {
  if (nivelAcesso === 'PROFESSOR') return 'Professor';
  if (nivelAcesso === 'ADMIN') return 'Administrador';
  return 'Aluno';
};

export const getDashboardPathByRole = (nivelAcesso) => {
  if (nivelAcesso === 'PROFESSOR') return '/teacher';
  if (nivelAcesso === 'ADMIN') return '/admin';
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

export const buildSearchResults = (courses, users, term) => {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return {
      courses: [],
      users: [],
    };
  }

  const filteredCourses = courses.filter((course) => (
    `${course.nome || course.titulo || ''} ${course.descricao || ''}`.toLowerCase().includes(normalizedTerm)
  ));

  const filteredUsers = users.filter((user) => (
    `${user.nome || ''} ${user.email || ''} ${getUserRoleLabel(user.nivelAcesso)}`.toLowerCase().includes(normalizedTerm)
  ));

  return {
    courses: filteredCourses,
    users: filteredUsers,
  };
};
