import type { Floor } from "@/shared/types";
import type { SpaceNameError } from "@/store/useAppStore";
import { parseMeters, type MetersError } from "./parseMeters";

export type NewSpaceForm = { name: string; width: string; depth: string };
export type NewSpaceErrors = { name?: SpaceNameError; width?: MetersError; depth?: MetersError };

export type ValidateNewSpaceResult =
  { ok: true; name: string; floor: Floor } | { ok: false; errors: NewSpaceErrors };

/** 바닥 크기 카드 입력을 검사한다. 칸마다 무엇이 틀렸는지 돌려준다. */
export function validateNewSpace(
  form: NewSpaceForm,
  existingNames: readonly string[],
): ValidateNewSpaceResult {
  const name = form.name.trim();
  const width = parseMeters(form.width);
  const depth = parseMeters(form.depth);

  const errors: NewSpaceErrors = {};
  if (name === "") errors.name = "emptyName";
  else if (existingNames.some((existing) => existing.trim() === name))
    errors.name = "duplicateName";
  if (!width.ok) errors.width = width.reason;
  if (!depth.ok) errors.depth = depth.reason;

  if (errors.name || !width.ok || !depth.ok) return { ok: false, errors };
  return { ok: true, name, floor: { w: width.cm, h: depth.cm } };
}
