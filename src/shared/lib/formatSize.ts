/** 가구 크기 글자: cm 값들을 반올림해 " × "로 잇는다. 예) 60, 50 → "60 × 50 cm" */
export function formatSize(...cms: number[]): string {
  return `${cms.map((cm) => Math.round(cm)).join(" × ")} cm`;
}
