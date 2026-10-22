const dateTime = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Baku",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Admin cədvəlləri üçün: "22.10.2026, 14:05" (Bakı vaxtı). Yalnız serverdə render olunur. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
