/** 칸 높이 같은 cm 값을 입력칸·문구에 보일 글자로. 정수는 그대로, 균등 분배로 생긴 소수는 소수 첫째 자리까지. */
export function formatCm(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}
