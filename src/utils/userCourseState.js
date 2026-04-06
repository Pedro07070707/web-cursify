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
