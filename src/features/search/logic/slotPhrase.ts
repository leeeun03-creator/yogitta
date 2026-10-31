import type { Box, FurnitureType } from "@/shared/types";

/** 칸 이름이 정해진 종류: 칸 번호 순서대로 가구 이름 뒤에 붙는 말 ("책상 위", "침대 밑"). */
const FIXED: Partial<Record<FurnitureType, string[]>> = {
  desk: ["위"],
  table: ["위"],
  bed: ["위", "밑"],
  box: ["안"],
};
/** 위에서 n번째 칸을 부르는 말. */
const ROW_NOUN: Partial<Record<FurnitureType, string>> = { drawer: "서랍", shelf: "선반" };
const SIDES = ["왼쪽", "오른쪽"]; // 가로 칸이 둘(양문 수납장)이면 문으로 나눈다
const NO_SLOT = "안"; // 칸 없음: 가구 이름 뒤에 "안"

/**
 * 위치 문장의 칸 표현 (시안 07 위치 문장 규칙). 가구 이름 뒤에 붙는다:
 * 서랍장 "위에서 2번째 서랍", 선반 "위에서 3번째 선반", 벽걸이 "위에서 1번째 칸", 양문 수납장 "왼쪽 문 위에서 1번째 칸",
 * 책상·테이블 "위", 침대 "위"·"밑", 보관함 "안", 칸 없음(또는 칸 수 밖) "안".
 */
export function slotPhrase(box: Pick<Box, "type" | "rows" | "cols">, slot?: number): string {
  if (slot === undefined || slot < 0 || slot >= box.rows * box.cols) return NO_SLOT;
  const fixed = FIXED[box.type];
  if (fixed) return fixed[slot] ?? NO_SLOT;
  const row = Math.floor(slot / box.cols) + 1;
  const side = box.cols === SIDES.length ? `${SIDES[slot % box.cols] ?? ""} 문 ` : "";
  return `${side}위에서 ${row}번째 ${ROW_NOUN[box.type] ?? "칸"}`;
}
