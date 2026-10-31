import { rotatedBox } from "@/shared/lib/rotatedBox";
import type { AppData } from "@/shared/types";
import { updateStackedBox } from "./updateStackedBox";

/**
 * 현재 공간의 가구 하나를 가운데를 축으로 시계 방향 90도 돌린다.
 * 돌린 모양이 바닥보다 길거나 벽·다른 가구에 파고들면 그대로 둔다. 그 위에 올린 가구도 같이 돈다 (T29-2).
 */
export function rotateBox(data: AppData, id: string): AppData {
  return updateStackedBox(data, id, (box, space) => {
    const result = rotatedBox(box, space);
    return result.ok ? result.box : box;
  });
}
