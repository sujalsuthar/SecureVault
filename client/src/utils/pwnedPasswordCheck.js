const PWNED_RANGE_URL = "https://api.pwnedpasswords.com/range";

/**
 * Have I Been Pwned — Pwned Passwords (k-anonymity).
 * Only the first 5 characters of the SHA-1 hash are sent over the network.
 * @param {string} password
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ pwned: boolean, count: number }>}
 */
export async function checkPasswordPwned(password, signal) {
  if (password == null || typeof password !== "string" || password.length === 0) {
    return { pwned: false, count: 0 };
  }

  const hashBuffer = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const response = await fetch(`${PWNED_RANGE_URL}/${prefix}`, {
    signal,
    headers: {
      "Add-Padding": "true",
    },
  });

  if (!response.ok) {
    throw new Error(`Pwned password check failed (${response.status})`);
  }

  const body = await response.text();
  const lines = body.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const hashSuffix = line.slice(0, colonIndex).trim().toUpperCase();
    const countStr = line.slice(colonIndex + 1).trim();
    if (hashSuffix === suffix) {
      const count = Number.parseInt(countStr, 10);
      return { pwned: true, count: Number.isFinite(count) ? count : 0 };
    }
  }

  return { pwned: false, count: 0 };
}
