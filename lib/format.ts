/**
 * Rəqəm formatı — Intl-dən asılı deyil.
 * Səbəb: Node və brauzerin ICU məlumatları "az" dili üçün fərqli nəticə verir
 * (server "1,290", Chrome "1.290") və client komponentlərdə hidratasiya xətası yaranır.
 * Ayırıcılar CLDR-ə uyğundur: az — "1.290,5", ru — "1 290,5", en — "1,290.5".
 */
const separators: Record<string, { group: string; decimal: string }> = {
  az: { group: ".", decimal: "," },
  ru: { group: " ", decimal: "," },
  en: { group: ",", decimal: "." },
};

export function formatNumber(value: number, locale: string, maxFractionDigits = 2, minFractionDigits = 0): string {
  const { group, decimal } = separators[locale] ?? separators.az;
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(maxFractionDigits);
  let [int, frac = ""] = fixed.split(".");
  // Artıq sıfırları at, minimumu saxla
  frac = frac.replace(/0+$/, "");
  if (frac.length < minFractionDigits) frac = frac.padEnd(minFractionDigits, "0");
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${negative ? "−" : ""}${int}${frac ? decimal + frac : ""}`;
}

/** Ay və həftə günü adları — Intl-dən asılı deyil (bəzi brauzerlərdə "az" məlumatı yoxdur: "M10 21, Wed") */
const MONTHS: Record<string, string[]> = {
  az: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MONTHS_NOMINATIVE: Record<string, string[]> = {
  az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  en: MONTHS.en,
};
const WEEKDAYS: Record<string, string[]> = {
  az: ["bazar", "bazar ertəsi", "çərşənbə axşamı", "çərşənbə", "cümə axşamı", "cümə", "şənbə"],
  ru: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

/** "21 oktyabr, çərşənbə axşamı" / "21 октября, вторник" / "Tuesday, 21 October" */
export function formatDayLabel(date: Date, locale: string): string {
  const l = MONTHS[locale] ? locale : "az";
  const day = date.getDate();
  const month = MONTHS[l][date.getMonth()];
  const weekday = WEEKDAYS[l][date.getDay()];
  return l === "en" ? `${weekday}, ${day} ${month}` : `${day} ${month}, ${weekday}`;
}

/** Ayın adı (adlıq hal, böyük hərflə): "Oktyabr", "Октябрь", "October" — month 1–12 */
export function formatMonthName(month: number, locale: string): string {
  return (MONTHS_NOMINATIVE[locale] ?? MONTHS_NOMINATIVE.az)[month - 1];
}

/** "sentyabr 2026" / "сентябрь 2026" / "September 2026" — rəy tarixləri üçün; iso: "2026-09-12" */
export function formatMonthYear(iso: string, locale: string): string {
  const [y, m] = iso.split("-").map(Number);
  const l = MONTHS[locale] ? locale : "az";
  const name = l === "ru" ? MONTHS_NOMINATIVE.ru[m - 1].toLocaleLowerCase("ru") : MONTHS[l][m - 1];
  return `${name} ${y}`;
}

/** "5 oktyabr 2026" / "5 октября 2026" / "5 October 2026" — iso: "2026-10-05" */
export function formatDayMonthYear(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const l = MONTHS[locale] ? locale : "az";
  return `${d} ${MONTHS[l][m - 1]} ${y}`;
}
