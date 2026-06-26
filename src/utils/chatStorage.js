const buildThreadKey = (userA, userB) => {
  const ids = [Number(userA), Number(userB)].sort((a, b) => a - b);
  return `chatThread:${ids[0]}:${ids[1]}`;
};

const CHAT_THREAD_PREFIX = 'chatThread:';

const sortMessagesByDate = (messages) => (
  [...messages].sort((a, b) => new Date(a.dataChat) - new Date(b.dataChat))
);

export const getChatMessages = (userA, userB) => {
  if (!userA || !userB) return [];

  try {
    return sortMessagesByDate(JSON.parse(localStorage.getItem(buildThreadKey(userA, userB)) || '[]'));
  } catch {
    return [];
  }
};

export const appendChatMessage = (userA, userB, message) => {
  const currentMessages = getChatMessages(userA, userB);
  const nextMessages = sortMessagesByDate([...currentMessages, message]);
  localStorage.setItem(buildThreadKey(userA, userB), JSON.stringify(nextMessages));
  return nextMessages;
};

export const getUserConversationPartners = (currentUserId, users = []) => {
  if (!currentUserId) return users;

  const lastMessageMap = new Map();

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(CHAT_THREAD_PREFIX)) return;

    const [, firstId, secondId] = key.split(':');
    const currentId = String(currentUserId);

    if (firstId !== currentId && secondId !== currentId) return;

    const partnerId = firstId === currentId ? secondId : firstId;
    const messages = getChatMessages(currentUserId, partnerId);
    const lastMessage = messages[messages.length - 1];

    if (lastMessage) lastMessageMap.set(String(partnerId), lastMessage);
  });

  return [...users]
    .map((user) => ({ ...user, lastMessage: lastMessageMap.get(String(user.id)) || null }))
    .sort((a, b) => {
      if (a.lastMessage && b.lastMessage) return new Date(b.lastMessage.dataChat) - new Date(a.lastMessage.dataChat);
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return 0;
    });
};
