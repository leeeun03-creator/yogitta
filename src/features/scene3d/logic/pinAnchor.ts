import { SLOT_OPEN_CM } from "@/shared/constants/scene";
import type { SlotOpening } from "./slotOpening";

type Xyz = [number, number, number];

/**
 * 칸 위 핀이 시작하는 점 (가구 로컬 cm). 칸이 열렸으면 다 빠져나온 열린 칸의 앞쪽 윗면 가운데,
 * 열지 않는 가구·칸 없음이면 가구 맨 위 가운데(top)다.
 */
export function pinAnchor(top: number, opening: SlotOpening | null): Xyz {
  const tray = opening?.sliding[0];
  if (!tray) return [0, top, 0];
  const [x, y, z] = tray.position;
  const [, height, depth] = tray.size;
  return [x, y + height / 2, z + depth / 2 + SLOT_OPEN_CM];
}
