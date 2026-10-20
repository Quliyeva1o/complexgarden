import { siteConfig } from "@/config/site";
import type { CartLine } from "@/lib/store/cart";

/** Səbət üçün lazım olan minimal məhsul məlumatı (API-dən gəlir, artıq tərcümə olunub) */
export interface CartProduct {
  slug: string;
  name: string;
  image: string;
  category: string;
  world: "pool" | "garden";
  price: number;
  inStock: boolean;
  leadTimeDays?: number;
  subscriptionEligible: boolean;
  service?: { kind: "planting" | "install"; price: number };
}

export interface PricedLine {
  line: CartLine;
  product: CartProduct;
  /** Bir ədədin qiyməti (abunə endirimi daxil, xidmətsiz) */
  unitPrice: number;
  /** Bir ədəd üçün xidmət haqqı (seçilibsə) */
  servicePrice: number;
  total: number;
}

export interface CartTotals {
  lines: PricedLine[];
  /** Səbətdə olan, amma artıq satışda olmayan məhsullar */
  missing: CartLine[];
  itemCount: number;
  subtotal: number;
  /** Abunə endirimi ilə qənaət */
  savings: number;
  deliveryFee: number;
  /** Pulsuz çatdırılmaya qalan məbləğ (0 → pulsuzdur) */
  toFreeDelivery: number;
  total: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Səbətin bütün hesablamaları bir yerdə — səbət səhifəsi, checkout və WhatsApp mesajı eyni rəqəmi göstərir */
export function priceCart(lines: CartLine[], products: CartProduct[]): CartTotals {
  const discount = siteConfig.subscriptionDiscountPercent / 100;
  const priced: PricedLine[] = [];
  const missing: CartLine[] = [];

  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) {
      missing.push(line);
      continue;
    }
    const subscribed = Boolean(line.options.subscriptionDays) && product.subscriptionEligible;
    const unitPrice = round(subscribed ? product.price * (1 - discount) : product.price);
    const servicePrice = line.options.service && product.service ? product.service.price : 0;
    priced.push({ line, product, unitPrice, servicePrice, total: round((unitPrice + servicePrice) * line.quantity) });
  }

  const subtotal = round(priced.reduce((sum, l) => sum + l.total, 0));
  const savings = round(priced.reduce((sum, l) => sum + (l.product.price - l.unitPrice) * l.line.quantity, 0));
  const free = subtotal >= siteConfig.freeDeliveryThreshold;
  const deliveryFee = priced.length === 0 || free ? 0 : siteConfig.deliveryFee;

  return {
    lines: priced,
    missing,
    itemCount: priced.reduce((sum, l) => sum + l.line.quantity, 0),
    subtotal,
    savings,
    deliveryFee,
    toFreeDelivery: free ? 0 : round(siteConfig.freeDeliveryThreshold - subtotal),
    total: round(subtotal + deliveryFee),
  };
}
