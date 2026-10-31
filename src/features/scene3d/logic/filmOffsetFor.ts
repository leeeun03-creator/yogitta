import { DEG_TO_RAD } from "@/shared/constants/units";

type Screen = { width: number; height: number }; // 3D 그림 크기 (px)

/**
 * 3D 그림 전체를 화면 오른쪽으로 shiftPx만큼 옮기는 three.js 카메라 filmOffset (T15-2). three.js는 보이는 창의
 * 왼쪽 끝을 가까운 면 × filmOffset / 필름 폭만큼 옮기므로, 창을 왼쪽으로 옮겨 그림이 오른쪽으로 가게 음수로 준다.
 * 보는 곳·카메라 자리는 그대로라 누르기 판정·라벨도 같이 옮겨진다.
 */
export function filmOffsetFor(
  shiftPx: number,
  screen: Screen,
  fovDeg: number,
  filmGauge: number,
): number {
  const { width, height } = screen;
  if (shiftPx === 0 || width <= 0 || height <= 0) return 0;
  const aspect = width / height;
  const windowPerNear = aspect * 2 * Math.tan((fovDeg * DEG_TO_RAD) / 2); // 가까운 면에서 보이는 창 폭 / 거리
  const filmWidth = filmGauge * Math.min(aspect, 1);
  return -(shiftPx / width) * windowPerNear * filmWidth;
}
