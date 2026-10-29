/** 받침에 따라 고르는 조사 쌍 (받침 있음/없음). */
export type JosaPair = "은/는" | "이/가" | "을/를";

const HANGUL_FIRST = 0xac00; // "가"
const HANGUL_LAST = 0xd7a3; // "힣"
const FINALS = 28; // 한 글자 안의 받침 경우 수 (받침 없음 포함)
const DIGITS_WITH_FINAL = "0136780"; // 영·일·삼·육·칠·팔 (읽을 때 받침이 있다)
const LETTERS_WITH_FINAL = "lmn"; // 엘·엠·엔

/** 낱말 마지막 글자를 읽을 때 받침이 있는지. 한글은 글자로, 숫자·영어는 읽는 소리로 본다. */
function hasFinal(word: string): boolean {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code >= HANGUL_FIRST && code <= HANGUL_LAST) return (code - HANGUL_FIRST) % FINALS !== 0;
  if (/^[0-9]$/.test(last)) return DIGITS_WITH_FINAL.includes(last);
  if (/^[a-z]$/i.test(last)) return LETTERS_WITH_FINAL.includes(last.toLowerCase());
  return false; // 빈 낱말·이모지·기호는 받침 없음으로 본다
}

/** 낱말 뒤에 붙일 조사: 받침이 있으면 앞(은·이·을), 없으면 뒤(는·가·를). */
export function josa(word: string, pair: JosaPair): string {
  const [withFinal = "", withoutFinal = ""] = pair.split("/");
  return hasFinal(word) ? withFinal : withoutFinal;
}
