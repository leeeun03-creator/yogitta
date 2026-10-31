import type { FoundSpot } from "@/features/scene3d";
import { NO_SLOT_LABEL } from "@/shared/constants/item";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { ItemMatch } from "./matchItems";

/**
 * 지금 공간에서 찾은 물건들을 3D 위치 표시 점으로 바꾼다. 핀 라벨 둘째 줄은 "화장대 서랍장 · 2번째 서랍"
 * (칸 없음·칸 수 밖이면 "칸 없음")이고, 고른 결과(picked)만 isPicked다.
 */
export function foundSpots(matches: readonly ItemMatch[], picked: ItemMatch | null): FoundSpot[] {
  return matches.map(({ box, item }) => {
    const label = item.slot === undefined ? undefined : slotLabels(box)[item.slot];
    return {
      itemId: item.id,
      boxId: box.id,
      ...(label === undefined ? {} : { slot: item.slot }),
      itemName: item.name,
      place: `${box.name} · ${label ?? NO_SLOT_LABEL}`,
      isPicked: item.id === picked?.item.id,
    };
  });
}
