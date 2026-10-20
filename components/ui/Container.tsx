import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Max-width + yan boşluqlar. Bütün bölmələr bunun içində qurulur. */
export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mx-auto w-full max-w-site px-container-pad", className)} {...props} />;
}
