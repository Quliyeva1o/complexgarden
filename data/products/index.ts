import type { Product } from "@/lib/types";
import { irrigationProducts } from "./irrigation";
import { plantProducts } from "./plants";
import { poolProducts } from "./pool";
import { soilProducts } from "./soil";
import { waterProducts } from "./water";

export const products: Product[] = [
  ...poolProducts,
  ...plantProducts,
  ...soilProducts,
  ...irrigationProducts,
  ...waterProducts,
];
