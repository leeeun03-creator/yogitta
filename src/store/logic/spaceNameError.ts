import type { AppData, Space } from "@/shared/types";

/** 공간 이름이 틀린 까닭: 비었음, 다른 공간과 같음. */
export type SpaceNameError = "emptyName" | "duplicateName";

/** 공간 이름을 바꾸는 액션의 결과. 틀리면 데이터는 그대로다. */
export type SpaceResult = { ok: true; data: AppData } | { ok: false; reason: SpaceNameError };

/**
 * 공간 이름(앞뒤 공백을 지운 것)을 검사한다. 비었거나 다른 공간과 같으면 그 까닭, 괜찮으면 null.
 * exceptId 공간은 견주지 않는다 (자기 이름 그대로 바꾸기는 괜찮다).
 */
export function spaceNameError(
  spaces: readonly Space[],
  name: string,
  exceptId?: string,
): SpaceNameError | null {
  const trimmed = name.trim();
  if (trimmed === "") return "emptyName";
  const isTaken = spaces.some((space) => space.id !== exceptId && space.name.trim() === trimmed);
  return isTaken ? "duplicateName" : null;
}
