import { useState, type KeyboardEvent } from "react";
import { BOX_NAME_MAX_LENGTH } from "@/shared/constants/furniture";
import type { NameError } from "@/shared/lib/checkName";
import type { Box } from "@/shared/types";
import { TextField } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { boxNameMessage } from "../logic/boxNameMessage";

/**
 * 가구 이름 입력칸 (시안 04). Enter나 입력칸을 벗어나면 저장하고, Esc면 원래 이름으로 돌린다.
 * 같은 공간의 같은 이름·빈 이름·너무 긴 이름은 저장하지 않고 입력칸 아래에 까닭을 띄운다.
 * 고른 가구나 저장된 이름이 바뀌면(되돌리기 등) 새로 그리도록 부르는 쪽에서 key를 준다.
 */
export function BoxNameField({ box }: { box: Box }) {
  const renameBox = useAppStore((state) => state.renameBox);
  const [draft, setDraft] = useState(box.name);
  const [error, setError] = useState<NameError | null>(null);

  const save = () => {
    if (draft === box.name) return;
    const result = renameBox(box.id, draft);
    if (result.ok) setDraft(draft.trim());
    else setError(result.reason);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") {
      setDraft(box.name);
      setError(null);
    }
  };
  return (
    <TextField
      label="가구 이름"
      value={draft}
      maxLength={BOX_NAME_MAX_LENGTH * 2} // 너무 긴 이름은 막는 안내를 보이게 조금 더 받는다
      error={error ? boxNameMessage(error, draft) : undefined}
      onChange={(value) => {
        setDraft(value);
        setError(null);
      }}
      onKeyDown={handleKeyDown}
      onBlur={save}
      enterKeyHint="done"
    />
  );
}
