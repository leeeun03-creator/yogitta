import { NO_SLOT_LABEL } from "@/shared/constants/item";
import { slotLabels } from "@/shared/lib/slotLabels";
import type { Box } from "@/shared/types";

/** 칸 고르기 선택지: 그 가구의 칸 이름들(값은 칸 번호 글자) + 맨 끝 칸 없음(빈 글자). */
export function slotOptions(box: Pick<Box, "type" | "rows" | "cols">) {
  return [
    ...slotLabels(box).map((label, index) => ({ value: String(index), label })),
    { value: "", label: NO_SLOT_LABEL },
  ];
}
