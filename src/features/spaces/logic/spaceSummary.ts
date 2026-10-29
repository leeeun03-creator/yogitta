import { formatMeters } from "@/shared/lib/formatMeters";
import type { Space } from "@/shared/types";

/** 공간 전환 목록의 공간 한 줄 설명: "6.0 × 4.5 m · 가구 6 · 물건 23" (시안 01). */
export function spaceSummary({ floor, boxes }: Space): string {
  const items = boxes.reduce((sum, box) => sum + box.items.length, 0);
  const size = `${formatMeters(floor.w)} × ${formatMeters(floor.h)} m`;
  return `${size} · 가구 ${boxes.length} · 물건 ${items}`;
}
