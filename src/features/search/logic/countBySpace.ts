import type { Space } from "@/shared/types";
import type { ItemMatch } from "./matchItems";

/** 공간 하나에서 찾은 물건 수. */
export type SpaceCount = { space: Space; count: number };

/** 찾은 물건을 공간마다 센다. 공간 순서는 결과에 처음 나온 순서다 ("다른 공간에도 있어요: 형 방 1곳"). */
export function countBySpace(matches: readonly ItemMatch[]): SpaceCount[] {
  const counts = new Map<string, SpaceCount>();
  for (const { space } of matches) {
    const counted = counts.get(space.id);
    counts.set(space.id, { space, count: (counted?.count ?? 0) + 1 });
  }
  return [...counts.values()];
}
