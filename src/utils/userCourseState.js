const buildStorageKey = (userId) => `userCourseState:${userId}`;

export const getUserCourseState = (userId) => {
  if (!userId) return {};

  try {
    return JSON.parse(localStorage.getItem(buildStorageKey(userId)) || '{}');
  } catch {
    return {};
  }
};

export const getUserCourseEntry = (userId, courseId) => {
  const state = getUserCourseState(userId);
  return state[String(courseId)] || null;
};

export const saveUserCourseEntry = (userId, courseId, entry) => {
  const state = getUserCourseState(userId);
  const nextState = {
    ...state,
    [String(courseId)]: {
      enrolled: true,
      status: 'Em progresso',
      updatedAt: new Date().toISOString(),
      ...entry,
    },
  };

  localStorage.setItem(buildStorageKey(userId), JSON.stringify(nextState));
  return nextState[String(courseId)];
};

export const removeUserCourseEntry = (userId, courseId) => {
  const state = getUserCourseState(userId);
  delete state[String(courseId)];
  localStorage.setItem(buildStorageKey(userId), JSON.stringify(state));
};

// --- Avaliações de cursos (armazenamento local) ---
// TODO [DB_PENDING]: persistir avaliações no banco
// DADOS NECESSÁRIOS: tabela avaliacao (userId, courseId, nota, feedback, createdAt)
// INTEGRAÇÃO: substituir as funções abaixo por chamadas à api.post/get('/avaliacao')
// JÁ IMPLEMENTADO: estrutura de estado, modal de avaliação, cálculo de média

const RATINGS_KEY = 'courseRatings';

export const getCourseRatings = () => {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  } catch {
    return {};
  }
};

export const saveCourseRating = (userId, courseId, nota) => {
  const all = getCourseRatings();
  const key = `${userId}:${courseId}`;
  all[key] = { userId, courseId: String(courseId), nota, createdAt: new Date().toISOString() };
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
};

export const getUserRatingForCourse = (userId, courseId) => {
  const all = getCourseRatings();
  return all[`${userId}:${courseId}`] || null;
};

export const removeCourseRating = (userId, courseId) => {
  const all = getCourseRatings();
  delete all[`${userId}:${courseId}`];
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
};

export const getRatingsForCourse = (courseId) => {
  const all = getCourseRatings();
  return Object.values(all).filter((r) => String(r.courseId) === String(courseId));
};

export const calcCourseAverage = (courseId) => {
  const ratings = getRatingsForCourse(courseId);
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, r) => acc + r.nota, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};
