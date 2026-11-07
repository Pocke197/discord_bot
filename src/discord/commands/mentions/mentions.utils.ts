const parseMentionedUsersIds = (text: string): string[] => {
  const mentionRegex = /<@!?(\d+)>/g;
  const userIds: string[] = [];

  for (const match of text.matchAll(mentionRegex)) {
    userIds.push(match[1]);
  }

  return [...new Set(userIds)];
};

export { parseMentionedUsersIds };
