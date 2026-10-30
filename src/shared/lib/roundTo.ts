/** value를 step 단위로 반올림한다. 예) 133, 10 → 130 */
export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
