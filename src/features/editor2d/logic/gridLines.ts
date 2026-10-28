import { GRID_LINE_CM } from "@/shared/constants/grid";

/** 바닥 한 변 안쪽에 그릴 격자선 위치(cm). 양 끝(0, 길이)은 바닥 테두리라 뺀다. */
export function gridLines(lengthCm: number, stepCm: number = GRID_LINE_CM): number[] {
  if (stepCm <= 0) return [];
  const lines: number[] = [];
  for (let position = stepCm; position < lengthCm; position += stepCm) lines.push(position);
  return lines;
}
