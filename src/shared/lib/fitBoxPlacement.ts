import { BOX_MIN_SIZE_CM } from "@/shared/constants/furniture";
import type { Floor, Point } from "@/shared/types";
import { clamp } from "./clamp";
import { clampBoxCenter } from "./clampBoxCenter";

/** 새 가구를 놓을 자리: 가운데(cm, 2D)와 가로·깊이(cm). */
export type BoxPlacement = { center: Point; w: number; d: number };

/**
 * 실제로 놓일 자리. 크기는 최소 크기(10cm) ~ 바닥 크기로, 위치는 가구 전체가 바닥 안에 들어오게 맞춘다.
 * store가 놓을 때와 2D 평면도가 미리 겹침을 볼 때 같은 자리를 쓰려고 한 곳에 둔다.
 */
export function fitBoxPlacement(placement: BoxPlacement, floor: Floor): BoxPlacement {
  const w = clamp(placement.w, BOX_MIN_SIZE_CM, floor.w);
  const d = clamp(placement.d, BOX_MIN_SIZE_CM, floor.h);
  return { center: clampBoxCenter(placement.center, { w, d }, floor), w, d };
}
