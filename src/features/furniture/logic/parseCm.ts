/** cm 글자 하나를 정수 cm로. 소수는 반올림하고 쉼표 소수점도 받는다. 비었거나 숫자가 아니면 null. */
export function parseCm(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? Math.round(value) : null;
}
