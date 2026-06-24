import { resendEnv } from '@/lib/env';
import { isProduction } from '@/lib/env';

/**
 * Отправка OTP-кода на email через Resend.
 * Если RESEND_API_KEY не настроен — в не-проде код логируется в консоль и
 * возвращается флаг devCode, чтобы можно было тестировать без почты.
 */
export async function sendOtpEmail(email: string, code: string, purpose: 'register' | 'login' | 'recovery'): Promise<{ sent: boolean; devCode?: string }> {
  const titles: Record<string, string> = {
    register: 'Подтверждение регистрации в Holdy',
    login: 'Код для входа в Holdy',
    recovery: 'Восстановление пароля Holdy',
  };

  if (!process.env.RESEND_API_KEY) {
    // Не настроено — в деве отдаём код для теста, в проде это ошибка.
    if (isProduction) throw new Error('RESEND_API_KEY не настроен');
    console.log(`[otp] ${purpose} код для ${email}: ${code}`);
    return { sent: false, devCode: code };
  }

  const { RESEND_API_KEY, EMAIL_FROM } = resendEnv();
  const { Resend } = await import('resend');
  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: titles[purpose],
    html: renderEmail(code, titles[purpose]),
  });

  return { sent: true };
}

function renderEmail(code: string, title: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f7f7f5;padding:32px;color:#0d0d0f">
    <div style="max-width:440px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid rgba(17,17,19,0.07)">
      <div style="font-weight:800;font-size:20px;letter-spacing:-0.02em">Holdy</div>
      <h1 style="font-size:20px;margin:20px 0 8px">${title}</h1>
      <p style="color:#6c6e76;font-size:14px;margin:0 0 24px">Ваш одноразовый код. Действует 10 минут.</p>
      <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#f24e1e;text-align:center;background:#fff5f1;border-radius:14px;padding:18px 0">${code}</div>
      <p style="color:#9ca0a8;font-size:12px;margin:24px 0 0">Если вы не запрашивали код — просто проигнорируйте письмо.</p>
    </div>
  </div>`;
}
