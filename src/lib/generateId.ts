/**
 * Tokens.
 * Used for generating IDs and numbers of different bases.
 */
const TOKENS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Get a random token
 */
function getRandomToken() {
  return TOKENS[Math.round(Math.random() * (TOKENS.length - 1))];
}

/**
 * Get a string containing `n` random tokens
 */
export function getRandomTokens(n = 4) {
  return Array(n)
    .fill(undefined)
    .map(() => getRandomToken())
    .join('');
}

/**
 * Generate a somewhat unique ID.
 *
 * The returned ID consists of the following three componens:
 *  * Timestamp   - stringified, reversed, and converted to a base 64 number.
 *  * Session ID  - 3 random tokens. 64^3 possible combinations.
 *  * Local count - Counter containing the number of times this function has been called, converted to base 36 number.
 */
export const generateId = (function () {
  const timestamp = convertBase(
    `${Date.now()}`.split('').reverse().join(''),
    10,
    TOKENS.length
  );
  const session_id = getRandomTokens(3);
  const prefix = `${timestamp}_${session_id}`;
  var id = 0;
  return () => `${prefix}_${(id++).toString(36)}`;
})();

/**
 * Convert number from base to base
 */
export function convertBase(
  value: number | string,
  from_base: number = 10,
  to_base: number = TOKENS.length
) {
  to_base = Math.min(to_base, TOKENS.length);
  const from_tokens = TOKENS.slice(0, from_base);
  const to_tokens = TOKENS.slice(0, to_base);
  var total = `${value}`
    .split('')
    .reverse()
    .reduce(
      (prev, val, idx) =>
        prev + from_tokens.indexOf(val) * Math.pow(from_base, idx),
      0
    );
  var new_value = '';
  while (total > 0) {
    new_value = to_tokens[total % to_base] + new_value;
    total = (total - (total % to_base)) / to_base;
  }
  return new_value || '0';
}

export const generateRandomToken = (length = 64, timestamp = false) => {
  var msg = '';
  if (timestamp) msg += Date.now().toString(36);
  for (var i = 0; i < length; i++)
    msg += TOKENS.charAt(Math.floor(Math.random() * TOKENS.length));
  return msg;
};
