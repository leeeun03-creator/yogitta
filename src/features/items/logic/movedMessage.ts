import { josa } from "@/shared/lib/josa";

/** 물건을 다른 가구로 옮긴 뒤 안내: "여권을 보관함 1에 옮겼어요" (을/를은 받침으로 고른다). */
export function movedMessage(itemName: string, boxName: string): string {
  return `${itemName}${josa(itemName, "을/를")} ${boxName}에 옮겼어요`;
}
