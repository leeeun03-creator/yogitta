/** value를 low ~ high 안으로 당긴다. 범위가 뒤집혀 있으면(low > high, 들어갈 자리가 없음) 가운데를 준다. */
export function clamp(value: number, low: number, high: number): number {
  if (low > high) return (low + high) / 2;
  return Math.min(Math.max(value, low), high);
}
