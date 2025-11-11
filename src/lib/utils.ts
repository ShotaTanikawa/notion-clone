import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind クラスを条件付きで結合しつつ、競合クラスをマージするユーティリティ。
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
