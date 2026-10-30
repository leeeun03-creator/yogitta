/** 이름이 막힌 까닭: 비었음, 다른 것과 같음, 너무 김. */
export type NameError = "emptyName" | "duplicateName" | "tooLong";
export type NameCheck = { ok: true; name: string } | { ok: false; reason: NameError };

/** 띄어쓰기·대소문자만 다른 이름은 같은 이름으로 본다 (검색·위치 문장에서 헷갈리지 않게). */
const normalize = (name: string) => name.replace(/\s+/g, "").toLowerCase();

/**
 * 구역·가구 이름을 검사하고 앞뒤 공백을 지운 이름을 돌려준다.
 * others는 견줄 다른 이름들이다 (이름을 바꾸는 중이면 자기 이름은 빼고 준다).
 */
export function checkName(others: readonly string[], input: string, maxLength: number): NameCheck {
  const name = input.trim();
  if (name === "") return { ok: false, reason: "emptyName" };
  // 이모지 등이 한 글자로 세어지게 글자 단위로 센다
  if ([...name].length > maxLength) return { ok: false, reason: "tooLong" };
  if (others.some((other) => normalize(other) === normalize(name))) {
    return { ok: false, reason: "duplicateName" };
  }
  return { ok: true, name };
}
