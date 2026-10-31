import { FOUND_COLORS, FURNITURE_COLORS } from "@/shared/constants/colors3d";
import { PART_CM } from "@/shared/constants/furnitureParts";
import { SLOT_OPEN_CM } from "@/shared/constants/scene";
import type { Box } from "@/shared/types";
import { frontLayout } from "./frontLayout";
import { partBetween, type FurniturePart } from "./furniturePart";
import { rowSpans } from "./rowSpans";

/** 찾은 칸 열기: 빠져나오는 기존 부품과 함께 나오는 열린 칸, 숨기고 대신 보일 부품 (열린 문). */
export type SlotOpening = {
  slideKeys: string[]; // 정면으로 SLOT_OPEN_CM 빠져나오는 기존 부품 (서랍 앞판·손잡이)
  sliding: FurniturePart[]; // 같이 빠져나오는 열린 칸 (열린 칸 색, 윗면은 안쪽 색)
  hideKeys: string[]; // 열린 모양으로 바꾸려고 숨기는 기존 부품 (양문 수납장 그쪽 문·손잡이)
  fixed: FurniturePart[]; // 그 자리에 더하는 부품 (90도 열린 문)
};

const TRAY_LOOK = {
  color: FOUND_COLORS.openSlot,
  topColor: FOUND_COLORS.openInside,
  hasEdges: true,
};
const SIDES = ["left", "right"] as const;

/** 칸 자리(가로 x0~x1, 칸 높이 span) 뒤쪽에 넣어 둔 열린 칸 통. 빠져나오면 back부터 SLOT_OPEN_CM 앞까지 보인다. */
function tray(key: string, [x0, x1]: [number, number], y: [number, number], back: number) {
  return partBetween(key, [x0, y[0], back - SLOT_OPEN_CM], [x1, y[1], back], TRAY_LOOK);
}

/** 칸 높이 안쪽으로 판 두께만큼 들인 열린 칸 높이. */
const trayHeight = (box: Box, row: number): [number, number] => {
  const span = rowSpans(box)[row] ?? { bottom: 0, height: box.h };
  const inset = Math.min(PART_CM.board, span.height / 4);
  return [span.bottom + inset, span.bottom + span.height - inset];
};

/** 양문 수납장: 그쪽 문을 바깥 경첩에서 90도 연 판으로 바꾸고, 그 칸의 열린 칸을 꺼낸다. */
function cabinetOpening(box: Box, slot: number): SlotOpening {
  const { w, h, d } = box;
  const side = SIDES[slot % 2] ?? "left";
  const { bodyFront, frontFace } = frontLayout(d, PART_CM.doorHandle.depth);
  const doorWidth = (w - Math.min(PART_CM.gap, w / 4)) / 2;
  const edge = side === "left" ? -w / 2 : w / 2;
  const thickness = frontFace - bodyFront;
  const doorX: [number, number] =
    side === "left" ? [edge - thickness, edge] : [edge, edge + thickness];
  const inner: [number, number] =
    side === "left" ? [edge + PART_CM.board, 0] : [0, edge - PART_CM.board];
  const door = { color: FURNITURE_COLORS.cabinet, hasEdges: true };
  return {
    slideKeys: [],
    sliding: [tray("open-tray", inner, trayHeight(box, Math.floor(slot / 2)), bodyFront)],
    hideKeys: [`door-${side}`, `handle-${side}`],
    fixed: [
      partBetween(
        "open-door",
        [doorX[0], 0, frontFace],
        [doorX[1], h, frontFace + doorWidth],
        door,
      ),
    ],
  };
}

/**
 * 찾은 칸을 어떻게 여는지 (yogitta-design 5장 위치 표시 2단계). 서랍장은 그 서랍이 빠져나오고, 선반·벽걸이는 그 칸에서
 * 열린 칸이 앞으로 나오며, 양문 수납장은 그쪽 문이 열린다. 책상·테이블·침대·보관함과 칸 없음(또는 칸 수 밖)은 열지 않는다(null).
 */
export function slotOpening(box: Box, slot?: number): SlotOpening | null {
  if (slot === undefined || slot < 0 || slot >= box.rows * box.cols) return null;
  const inner: [number, number] = [-box.w / 2 + PART_CM.board, box.w / 2 - PART_CM.board];
  if (box.type === "drawer") {
    const { bodyFront } = frontLayout(box.d, PART_CM.drawerHandle.depth);
    return {
      slideKeys: [`front-${slot}`, `handle-${slot}`],
      sliding: [tray("open-tray", inner, trayHeight(box, slot), bodyFront)],
      hideKeys: [],
      fixed: [],
    };
  }
  if (box.type === "shelf" || box.type === "wall") {
    const sliding = [tray("open-tray", inner, trayHeight(box, slot), box.d / 2)];
    return { slideKeys: [], sliding, hideKeys: [], fixed: [] };
  }
  if (box.type === "cabinet" && box.cols === SIDES.length) return cabinetOpening(box, slot);
  return null;
}
