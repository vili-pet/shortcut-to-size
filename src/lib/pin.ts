const TEAR = "sts-pin-v1";

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${TEAR}:${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export function makeSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toHex(bytes.buffer);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

export async function verifyPin(
  pin: string,
  salt: string,
  hash: string,
): Promise<boolean> {
  const next = await hashPin(pin, salt);
  return next === hash;
}
