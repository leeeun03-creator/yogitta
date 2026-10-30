import { useId, type KeyboardEvent } from "react";
import { FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import type { Box } from "@/shared/types";
import { Button, TextField } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { useSizeDraft } from "../hooks/useSizeDraft";
import type { SizeDraft } from "../logic/parseSize";
import { sizeMessage } from "../logic/sizeMessage";
import styles from "./BoxSizeFields.module.css";

const FIELDS: { key: keyof SizeDraft; label: string }[] = [
  { key: "w", label: "가로" },
  { key: "d", label: "깊이" },
  { key: "h", label: "높이" },
];

/**
 * 크기 입력칸 (가로·깊이·높이 cm, 시안 04). Enter나 입력칸을 벗어나면 바꾸고, Esc면 지금 크기로 돌린다.
 * 숫자가 아니거나 막히는 크기(너무 작음·바닥보다 김·너무 높음·벽이나 다른 가구와 겹침)는 바꾸지 않고 까닭을 띄운다.
 * 크기가 바뀌면 부르는 쪽에서 key로 새로 그린다.
 */
export function BoxSizeFields({ box }: { box: Box }) {
  const { draft, error, save, cancel, change } = useSizeDraft(box);
  const labelId = useId();
  const errorId = useId();
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") cancel();
  };
  return (
    <div className={styles.field}>
      <p id={labelId} className={styles.label}>
        크기 (cm)
      </p>
      <div role="group" aria-labelledby={labelId} className={styles.inputs}>
        {FIELDS.map(({ key, label }) => (
          <TextField
            key={key}
            label={label}
            value={draft[key]}
            inputMode="decimal"
            invalid={error ? { describedBy: errorId } : undefined}
            onChange={(value) => change(key, value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {sizeMessage(error)}
        </p>
      )}
      <TypeHeightButton box={box} />
    </div>
  );
}

/** 높이가 그 종류의 기본 높이와 다르면 기본 높이로 바꾸는 버튼 (종류를 바꿔도 크기는 그대로라서). */
function TypeHeightButton({ box }: { box: Pick<Box, "id" | "type" | "h"> }) {
  const applyTypeHeight = useAppStore((state) => state.applyTypeHeight);
  const typeHeight = FURNITURE_DEFAULTS[box.type].h;
  if (box.h === typeHeight) return null;
  return (
    <Button className={styles.typeHeight} onClick={() => applyTypeHeight(box.id)}>
      기본 높이 {typeHeight}cm로
    </Button>
  );
}
