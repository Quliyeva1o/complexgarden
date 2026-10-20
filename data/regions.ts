import { L } from "./_helpers";

/** Bitki pasportunda "uyğun bölgələr" */
export const plantRegions = {
  absheron: L("Abşeron", "Апшерон", "Absheron"),
  "guba-khachmaz": L("Quba-Xaçmaz", "Губа-Хачмаз", "Guba-Khachmaz"),
  lankaran: L("Lənkəran", "Ленкорань", "Lankaran"),
  "ganja-gazakh": L("Gəncə-Qazax", "Гянджа-Газах", "Ganja-Gazakh"),
  "shaki-zagatala": L("Şəki-Zaqatala", "Шеки-Загатала", "Shaki-Zagatala"),
} as const;

/** Checkout-da çatdırılma rayonları (Bakı və ətrafı) */
export const deliveryDistricts = [
  { slug: "nasimi", name: L("Nəsimi", "Насими", "Nasimi") },
  { slug: "yasamal", name: L("Yasamal", "Ясамал", "Yasamal") },
  { slug: "narimanov", name: L("Nərimanov", "Нариманов", "Narimanov") },
  { slug: "sabail", name: L("Səbail", "Сабаил", "Sabail") },
  { slug: "nizami", name: L("Nizami", "Низами", "Nizami") },
  { slug: "khatai", name: L("Xətai", "Хатаи", "Khatai") },
  { slug: "binagadi", name: L("Binəqədi", "Бинагади", "Binagadi") },
  { slug: "sabunchu", name: L("Sabunçu", "Сабунчу", "Sabunchu") },
  { slug: "surakhani", name: L("Suraxanı", "Сураханы", "Surakhani") },
  { slug: "khazar", name: L("Xəzər", "Хазар", "Khazar") },
  { slug: "garadagh", name: L("Qaradağ", "Гарадаг", "Garadagh") },
  { slug: "absheron", name: L("Abşeron rayonu", "Абшеронский район", "Absheron district") },
  { slug: "sumgait", name: L("Sumqayıt", "Сумгаит", "Sumgait") },
] as const;
