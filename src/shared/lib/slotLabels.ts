import type { Box, FurnitureType } from "@/shared/types";

/** 칸 이름이 정해진 종류 (칸 수를 바꿀 수 없는 가구): 칸 번호 순서대로. */
const FIXED_LABELS: Partial<Record<FurnitureType, string[]>> = {
  bed: ["침대 위", "침대 밑"],
  desk: ["상판 위"],
  table: ["테이블 위"],
  box: ["보관함 안"],
};

/** 위에서 n번째 칸을 가구 종류에 맞게 부르는 말 (용어집: 화면 문구에서는 칸을 종류에 맞게 부른다). */
const ROW_NOUN: Partial<Record<FurnitureType, string>> = { drawer: "서랍", shelf: "선반" };

/** 가로 칸이 두 개(양문 수납장)면 왼쪽·오른쪽 문으로 나눈다. */
const SIDES = ["왼쪽", "오른쪽"];

/**
 * 칸마다 화면에 보일 이름 (칸 번호 = 배열 자리, 위 칸부터 줄마다 왼쪽 → 오른쪽).
 * 서랍장 "1번째 서랍", 선반 "1번째 선반", 벽걸이 "1번째 칸", 양문 수납장 "왼쪽 1번째 칸",
 * 침대 "침대 위"·"침대 밑", 책상 "상판 위", 테이블 "테이블 위", 보관함 "보관함 안".
 */
export function slotLabels(box: Pick<Box, "type" | "rows" | "cols">): string[] {
  const fixed = FIXED_LABELS[box.type];
  if (fixed) return fixed;
  const noun = ROW_NOUN[box.type] ?? "칸";
  return Array.from({ length: box.rows * box.cols }, (_, slot) => {
    const row = Math.floor(slot / box.cols) + 1;
    const side = box.cols === SIDES.length ? `${SIDES[slot % box.cols] ?? ""} ` : "";
    return `${side}${row}번째 ${noun}`;
  });
}
