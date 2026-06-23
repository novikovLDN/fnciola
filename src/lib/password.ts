/**
 * Базовая проверка стойкости пароля (§6, §11.1): минимум 8 символов.
 * Возвращает уровень и список замечаний для UI.
 */
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  valid: boolean;
  issues: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const issues: string[] = [];
  if (password.length < 8) issues.push('минимум 8 символов');

  let variety = 0;
  if (/[a-zа-яё]/.test(password)) variety++;
  if (/[A-ZА-ЯЁ]/.test(password)) variety++;
  if (/[0-9]/.test(password)) variety++;
  if (/[^A-Za-zА-Яа-яЁё0-9]/.test(password)) variety++;

  if (variety < 2 && password.length < 12) {
    issues.push('добавьте цифры или спецсимволы');
  }

  let score: PasswordStrength['score'] = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (variety >= 3) score++;
  if (variety >= 4 && password.length >= 10) score++;
  score = Math.min(4, score) as PasswordStrength['score'];

  const labels = ['очень слабый', 'слабый', 'средний', 'хороший', 'надёжный'];
  return {
    score,
    label: labels[score],
    valid: password.length >= 8,
    issues,
  };
}
