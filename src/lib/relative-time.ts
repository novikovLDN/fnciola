/** Относительное время по-русски: «только что», «5 минут назад», «1 день назад». */
export function relativeTime(date: string | number | Date): string {
  const t = new Date(date).getTime();
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return 'только что';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${plural(min, 'минуту', 'минуты', 'минут')} назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${plural(hr, 'час', 'часа', 'часов')} назад`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ${plural(day, 'день', 'дня', 'дней')} назад`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon} ${plural(mon, 'месяц', 'месяца', 'месяцев')} назад`;
  const yr = Math.floor(mon / 12);
  return `${yr} ${plural(yr, 'год', 'года', 'лет')} назад`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
