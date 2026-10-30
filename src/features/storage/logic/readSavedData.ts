import type { AppData } from "@/shared/types";
import { isAppData } from "./isAppData";

/** 저장된 값을 읽은 결과: 없음, 읽음(데이터), 깨짐(JSON이 아니거나 모양·버전이 다름). */
export type SavedData = { kind: "none" } | { kind: "ok"; data: AppData } | { kind: "broken" };

/** 지금 공간이 공간 목록에 없으면 맨 앞 공간으로 (공간이 없으면 null). */
function withCurrentSpace(data: AppData): AppData {
  const { spaces, currentSpaceId } = data;
  if (spaces.some((space) => space.id === currentSpaceId)) return data;
  return { ...data, currentSpaceId: spaces[0]?.id ?? null };
}

/** localStorage에서 읽은 글자(raw, 없으면 null)를 저장 데이터로 바꾼다. 깨진 값은 쓰지 않고 broken으로 알린다. */
export function readSavedData(raw: string | null): SavedData {
  if (raw === null) return { kind: "none" };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { kind: "broken" };
  }
  return isAppData(value) ? { kind: "ok", data: withCurrentSpace(value) } : { kind: "broken" };
}
