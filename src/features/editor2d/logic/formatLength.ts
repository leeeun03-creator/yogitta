import { formatMeters } from "@/shared/lib/formatMeters";

/**
 * 길이 표시 글자. 길이 하나면 "1.2 m", 가로·세로 둘이면 "3.0 × 2.5 m".
 * cm 아래는 반올림하고, 하나라도 0이면 보여줄 길이가 없으니 null.
 */
export function formatLength(widthCm: number, depthCm?: number): string | null {
  const lengths = depthCm === undefined ? [widthCm] : [widthCm, depthCm];
  const rounded = lengths.map((cm) => Math.round(Math.abs(cm)));
  if (rounded.some((cm) => cm === 0)) return null;
  return `${rounded.map(formatMeters).join(" × ")} m`;
}
