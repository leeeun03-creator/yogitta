import { BOX_NAME_MAX_LENGTH } from "@/shared/constants/furniture";
import type { NameError } from "@/shared/lib/checkName";
import { josa } from "@/shared/lib/josa";

/** 가구 이름이 막힌 까닭을 화면 안내 문구로 바꾼다. 같은 이름이면 그 이름을 넣어 알린다 (기획서 3.4). */
export function boxNameMessage(reason: NameError, input: string): string {
  if (reason === "emptyName") return "가구 이름을 써 주세요";
  if (reason === "tooLong") return `가구 이름은 ${BOX_NAME_MAX_LENGTH}자까지 쓸 수 있어요`;
  const name = input.trim();
  return `이미 '${name}'${josa(name, "이/가")} 있어요`;
}
