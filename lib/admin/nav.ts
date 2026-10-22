/** Yan menyu. Növbəti planlar bura bölmə əlavə edir (Məhsullar, Kateqoriyalar, Sifarişlər, Sorğular). */
export const adminNav = [
  { href: "/admin", label: "İcmal", icon: "LayoutDashboard" },
  { href: "/admin/adminler", label: "Adminlər", icon: "Users" },
] as const;

export type AdminNavIcon = (typeof adminNav)[number]["icon"];
