const MASKED_USERNAME_PATTERN = /^u\*\*\*\*\d{2}$/;

/** Site-wide public display format: u****42 */
export function isMaskedUsername(username: string): boolean {
  return MASKED_USERNAME_PATTERN.test(username);
}

/** Random masked username for live tickers and feeds. */
export function maskUsername(suffix?: number): string {
  const digits =
    suffix !== undefined
      ? String(suffix % 100).padStart(2, "0")
      : String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `u****${digits}`;
}

/** Stable masked username from a user id or raw name (leaderboard, DB rows). */
export function maskUsernameFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, seed.charCodeAt(i)) + hash) >>> 0;
  }
  return maskUsername(hash);
}

/**
 * Public-facing username — always masked unless already in u****XX form.
 * Logged-in user's real name is shown only in the sidebar.
 */
export function getPublicUsername(
  username: string,
  userId?: string | null,
): string {
  if (isMaskedUsername(username)) return username;
  return maskUsernameFromSeed(userId ?? username);
}

/** Replace raw user_* tokens in a string with a masked name. */
export function maskUsernameInText(text: string): string {
  return text.replace(/user_\d+/gi, () => maskUsername());
}
