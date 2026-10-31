import type { Space } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import { boxObstacles } from "./boxObstacles";
import { heightSpan } from "./heightSpan";
import { isBoxBlocked } from "./isBoxBlocked";

/**
 * 벽이나 (높이가 겹치는) 다른 가구와 겹쳐 있는 가구 id들. 놓기·옮기기·돌리기·벽 긋기는 겹치지 않게 막지만,
 * 가져온 백업 파일 등에서는 겹쳐 있을 수 있어 알려 준다. 가구 둘이 겹치면 둘 다 들어간다.
 */
export function overlappingBoxes(space: Pick<Space, "walls" | "boxes">): Set<string> {
  const result = new Set<string>();
  for (const box of space.boxes) {
    const center = { x: box.x, y: box.z }; // 2D y = 3D z
    if (isBoxBlocked(center, boxFootprint(box), boxObstacles(space, box.id, heightSpan(box))))
      result.add(box.id);
  }
  return result;
}
