import { LINE_MIN_POINTS } from "@/shared/constants/units";
import { isWallBlocked } from "@/shared/lib/isWallBlocked";
import type { AppData, Wall } from "@/shared/types";
import { updateCurrentSpace } from "./updateCurrentSpace";

/**
 * 현재 공간에 벽 하나를 더한다. 점이 2개보다 적은 벽은 더하지 않는다.
 * 벽이 가구에 파고들면 더하지 않고 그대로 둔다 (가구 면에 맞닿는 것은 된다).
 */
export function addWall(data: AppData, wall: Wall): AppData {
  if (wall.points.length < LINE_MIN_POINTS) return data;
  return updateCurrentSpace(data, (space) =>
    isWallBlocked(wall, space.boxes) ? space : { ...space, walls: [...space.walls, wall] },
  );
}
