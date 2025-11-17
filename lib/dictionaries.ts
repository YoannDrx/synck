import "server-only";

import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "./i18n-config";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("@/dictionaries/fr").then((module) => module.default),
  en: () => import("@/dictionaries/en").then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
