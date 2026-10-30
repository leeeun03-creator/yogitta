const AUTO_NUMBER = /^[1-9]\d*$/; // 1부터, 앞에 0 없이 (nextBoxName이 붙이는 번호)

/** 이름이 그 종류의 자동 이름("보관함 3")인지. 사용자가 지은 이름("내 보관함 1", "보관함 1a")은 아니다. */
export function isAutoName(name: string, label: string): boolean {
  const prefix = `${label} `;
  return name.startsWith(prefix) && AUTO_NUMBER.test(name.slice(prefix.length));
}
