import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { prisma } from "lib/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

