import { formatMeters } from "@/shared/lib/formatMeters";
import type { Space } from "@/shared/types";

/**
 * 공간 전환 목록의 공간 한 줄 설명 조각: ["6.0 × 4.5 m", "가구 6", "물건 23"] (시안 01).
 * 화면에서는 " · "로 잇고, 좁으면 조각 사이에서만 줄을 바꾼다.
 */
export function spaceSummaryParts({ floor, boxes }: Space): string[] {
  const items = boxes.reduce((sum, box) => sum + box.items.length, 0);
  const size = `${formatMeters(floor.w)} × ${formatMeters(floor.h)} m`;
  return [size, `가구 ${boxes.length}`, `물건 ${items}`];
}
