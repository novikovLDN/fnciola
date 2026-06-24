import bcrypt from 'bcryptjs';

/** Хеширование паролей (bcrypt, высокая цена). Минимум 8 символов проверяется выше. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
