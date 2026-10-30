import { ITEM_MEMO_MAX_LENGTH, ITEM_NAME_MAX_LENGTH } from "@/shared/constants/item";
import type { ItemError } from "@/store/useAppStore";

const MESSAGES: Record<ItemError, string> = {
  emptyName: "물건 이름을 써 주세요",
  tooLong: `물건 이름은 ${ITEM_NAME_MAX_LENGTH}자까지 쓸 수 있어요`,
  memoTooLong: `메모는 ${ITEM_MEMO_MAX_LENGTH}자까지 쓸 수 있어요`,
};

/** 물건을 못 넣은 까닭을 화면 안내 문구로 바꾼다. */
export function itemMessage(reason: ItemError): string {
  return MESSAGES[reason];
}
