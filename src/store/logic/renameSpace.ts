import type { AppData } from "@/shared/types";
import { spaceNameError, type SpaceResult } from "./spaceNameError";

/**
 * id 공간의 이름을 바꾼 새 데이터 (앞뒤 공백은 지운다). 빈 이름·다른 공간과 같은 이름은 막는다.
 * 없는 공간이거나 이름이 그대로면 데이터도 그대로다.
 */
export function renameSpace(data: AppData, id: string, name: string): SpaceResult {
  const error = spaceNameError(data.spaces, name, id);
  if (error) return { ok: false, reason: error };
  const trimmed = name.trim();
  const target = data.spaces.find((space) => space.id === id);
  if (!target || target.name === trimmed) return { ok: true, data };
  const spaces = data.spaces.map((space) =>
    space.id === id ? { ...space, name: trimmed } : space,
  );
  return { ok: true, data: { ...data, spaces } };
}
