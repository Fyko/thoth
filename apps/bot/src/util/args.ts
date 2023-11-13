import type { LocaleParam } from "@yuudachi/framework/types";
import i18n from "i18next";

export function parseLimit(
  limit: number | undefined,
  lng: LocaleParam,
): number {
  if (!limit) return 25; // the default
  if (limit <= 0 || limit > 100)
    throw new Error(i18n.t("common.errors.limit_out_of_range", { lng }));

  return limit;
}
