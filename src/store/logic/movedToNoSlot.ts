import type { AppData } from "@/shared/types";
import { currentBox } from "./currentBox";

/** 가구 하나의 칸 없음 물건 수 (가구가 없으면 0). */
const noSlotCount = (data: AppData, boxId: string) =>
  currentBox(data, boxId)?.items.filter((item) => item.slot === undefined).length ?? 0;

/** 바꾸기 전(before)과 뒤(after) 사이에 가구 boxId의 칸 없음 물건이 몇 개 늘었나 (칸이 줄어 옮겨진 물건 수). */
export function movedToNoSlot(before: AppData, after: AppData, boxId: string): number {
  return Math.max(0, noSlotCount(after, boxId) - noSlotCount(before, boxId));
}
