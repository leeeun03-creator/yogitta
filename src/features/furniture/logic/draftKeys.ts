import type { KeyboardEvent } from "react";

/** 속성 패널 입력칸 키: Enter는 저장, Esc는 지금 값으로 되돌리기 (이름·크기·칸 높이·설치 높이가 함께 쓴다). */
export function draftKeys(save: () => void, cancel: () => void) {
  return (event: Pick<KeyboardEvent<HTMLInputElement>, "key">) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") cancel();
  };
}
