import { FLOOR_MAX_CM, FLOOR_MIN_CM } from "@/shared/constants/floor";
import { CM_PER_M } from "@/shared/constants/units";

export type MetersError = "empty" | "notNumber" | "tooSmall" | "tooLarge";
export type ParseMetersResult = { ok: true; cm: number } | { ok: false; reason: MetersError };

const NUMBER_PATTERN = /^(\d+(\.\d*)?|\.\d+)$/;

/** 바닥 크기 입력(m, 쉼표 소수 허용)을 cm로 바꾸고 범위를 검사한다. */
export function parseMeters(text: string): ParseMetersResult {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return { ok: false, reason: "empty" };

  const isNegative = trimmed.startsWith("-") && NUMBER_PATTERN.test(trimmed.slice(1));
  if (isNegative) return { ok: false, reason: "tooSmall" };
  if (!NUMBER_PATTERN.test(trimmed)) return { ok: false, reason: "notNumber" };

  const cm = Math.round(Number(trimmed) * CM_PER_M);
  if (cm < FLOOR_MIN_CM) return { ok: false, reason: "tooSmall" };
  if (cm > FLOOR_MAX_CM) return { ok: false, reason: "tooLarge" };
  return { ok: true, cm };
}
