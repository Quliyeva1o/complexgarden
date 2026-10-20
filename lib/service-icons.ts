import { Droplets, Leaf, Shovel, SprayCan, Sprout, Trees, type LucideIcon } from "lucide-react";
import type { Service } from "@/lib/types";

/** Xidmət ikonları — data/services.ts-dəki `icon` adından lucide komponentinə */
export const serviceIcons: Record<Service["icon"], LucideIcon> = { Trees, Sprout, Droplets, Leaf, SprayCan, Shovel };
