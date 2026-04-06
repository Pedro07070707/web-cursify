const buildThreadKey = (userA, userB) => {
  const ids = [Number(userA), Number(userB)].sort((a, b) => a - b);
  return `chatThread:${ids[0]}:${ids[1]}`;
};

export const getChatMessages = (userA, userB) => {
  if (!userA || !userB) return [];

  try {
    return JSON.parse(localStorage.getItem(buildThreadKey(userA, userB)) || '[]');
  } catch {
    return [];
  }
};

export const appendChatMessage = (userA, userB, message) => {
  const currentMessages = getChatMessages(userA, userB);
  const nextMessages = [...currentMessages, message];
  localStorage.setItem(buildThreadKey(userA, userB), JSON.stringify(nextMessages));
  return nextMessages;
};
