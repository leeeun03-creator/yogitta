/** 새 가구 자동 이름: "보관함 1"부터 공간 안에서 아직 안 쓴 가장 작은 번호를 붙인다. */
export function nextBoxName(names: readonly string[], label: string): string {
  const used = new Set(names);
  let number = 1;
  while (used.has(`${label} ${number}`)) number++;
  return `${label} ${number}`;
}
