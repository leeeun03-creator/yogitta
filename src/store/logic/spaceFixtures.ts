import { DATA_VERSION } from "@/shared/constants/storage";
import type { AppData } from "@/shared/types";

/** 공간 단위 코드 테스트에서 함께 쓰는 데이터: 이름마다 빈 공간 하나 (id는 space_1부터), 지금 공간은 current번째. */
export function createSpacesData(names: string[], current = 0): AppData {
  const spaces = names.map((name, index) => ({
    id: `space_${index + 1}`,
    name,
    floor: { w: 600, h: 450 },
    rooms: [],
    walls: [],
    boxes: [],
  }));
  return { version: DATA_VERSION, spaces, currentSpaceId: spaces[current]?.id ?? null };
}

/** 테스트 중 원본이 바뀌면 바로 에러가 나도록 깊게 얼린다. */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
