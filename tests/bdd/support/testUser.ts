export type TestUser = {
  email: string;
  password: string;
};

function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `bdd_${timestamp}_${random}@example.com`;
}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = `${upper}${lower}${digits}${symbols}`;
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const length = 12;
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < length) {
    chars.push(pick(all));
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function createTestUser(): TestUser {
  return {
    email: generateUniqueEmail(),
    password: generatePassword(),
  };
}
