const extractSteamId = (openId: string): string | null => {
  const match = openId.match(
    /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/,
  );
  return match ? match[1] : null;
};

export { extractSteamId };
