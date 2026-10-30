import { createId } from "@/shared/lib/createId";
import type { Floor, Point, Wall } from "@/shared/types";
import { change, type GetCore, type SetCore } from "./change";
import { addWall } from "./logic/addWall";
import { eraseSegment } from "./logic/eraseSegment";
import { moveWallPoint, type WallMoveResult } from "./logic/moveWallPoint";
import { resizeFloor, type FloorResizeResult } from "./logic/resizeFloor";

export type WallActions = {
  addWall: (wall: Omit<Wall, "id">) => void; // 현재 공간에 더한다
  eraseSegment: (wallId: string, segment: number) => void;
  moveWallPoint: (from: Point, to: Point) => WallMoveResult; // 붙은 벽 점도 같이, 막히면 그대로
  resizeFloor: (floor: Floor) => FloorResizeResult; // 무언가 바닥 밖으로 나가면 그대로
};

/** 벽·바닥 액션 (현재 공간). 모두 되돌리기 한 번씩이고, 막히면 데이터는 그대로다. */
export const wallActions = (set: SetCore, get: GetCore): WallActions => ({
  addWall: (wall) =>
    set((state) => change(state, addWall(state.data, { ...wall, id: createId("wall") }))),
  eraseSegment: (wallId, segment) =>
    set((state) => change(state, eraseSegment(state.data, { wallId, segment }, createId("wall")))),
  moveWallPoint: (from, to) => {
    const result = moveWallPoint(get().data, from, to);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
  resizeFloor: (floor) => {
    const result = resizeFloor(get().data, floor);
    if (result.ok) set((state) => change(state, result.data));
    return result;
  },
});
