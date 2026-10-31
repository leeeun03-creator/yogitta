import { BOX_ROTATION_STEP, FULL_TURN } from "@/shared/constants/furniture";
import type { Box, Floor, Point } from "@/shared/types";
import { boxFootprint } from "./boxFootprint";
import { clampBoxCenter } from "./clampBoxCenter";
import { heightSpan } from "./heightSpan";
import { isStackedOn } from "./isStackedOn";

/** 받침 가구 가운데에서 본 자리(cm)를 시계 방향 90도씩 turns번 돌린다 (2D: 오른쪽 → 아래). */
function turnOffset(offset: Point, turns: number): Point {
  let { x, y } = offset;
  for (let turn = 0; turn < turns; turn++) [x, y] = [-y, x];
  return { x, y };
}

/**
 * 받침 가구가 before에서 after로 바뀌었을 때 그 위에 올린 가구(두 층 포함)를 같이 옮긴 가구 목록 (T29-2).
 * 받침 가구 가운데를 따라 옮기고, 돌린 만큼 받침 가구 가운데를 축으로 돌리며, 윗면 높이가 바뀐 만큼 설치 높이를 바꾼다.
 * 바닥 밖으로는 나가지 않게 당긴다. boxes에는 after가 들어 있어도 되고, 자리·높이가 그대로면 boxes를 그대로 돌려준다.
 */
export function carryStacked(
  boxes: readonly Box[],
  before: Box,
  after: Box,
  floor: Floor,
): readonly Box[] {
  const turns = ((after.rotation - before.rotation + FULL_TURN) % FULL_TURN) / BOX_ROTATION_STEP;
  const rise = heightSpan(after).top - heightSpan(before).top;
  if (turns === 0 && rise === 0 && after.x === before.x && after.z === before.z) return boxes;
  return boxes.map((box) => {
    if (!isStackedOn(boxes, box.id, before.id)) return box;
    const offset = turnOffset({ x: box.x - before.x, y: box.z - before.z }, turns); // 2D y = 3D z
    const rotation = (box.rotation + turns * BOX_ROTATION_STEP) % FULL_TURN;
    const moved = { x: after.x + offset.x, y: after.z + offset.y };
    const center = clampBoxCenter(moved, boxFootprint({ ...box, rotation }), floor);
    return { ...box, x: center.x, z: center.y, rotation, elevation: box.elevation + rise };
  });
}
