import { useId, useState, type KeyboardEvent } from "react";
import { FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import type { Box } from "@/shared/types";
import { Button, TextField } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import { parseSize, type SizeDraft } from "../logic/parseSize";
import { sizeMessage, type SizeError } from "../logic/sizeMessage";
import styles from "./BoxSizeFields.module.css";

const FIELDS: { key: keyof SizeDraft; label: string }[] = [
  { key: "w", label: "가로" },
  { key: "d", label: "깊이" },
  { key: "h", label: "높이" },
];

const draftOf = (box: Box): SizeDraft => ({ w: String(box.w), d: String(box.d), h: String(box.h) });

/**
 * 크기 입력칸 (가로·깊이·높이 cm, 시안 04). Enter나 입력칸을 벗어나면 바꾸고, Esc면 지금 크기로 돌린다.
 * 숫자가 아니거나 막히는 크기(너무 작음·바닥보다 김·너무 높음·벽이나 다른 가구와 겹침)는 바꾸지 않고 까닭을 띄운다.
 * 높이가 그 종류의 기본 높이와 다르면 기본 높이로 바꾸는 버튼을 단다. 크기가 바뀌면 부르는 쪽에서 key로 새로 그린다.
 */
export function BoxSizeFields({ box }: { box: Box }) {
  const resizeBox = useAppStore((state) => state.resizeBox);
  const applyTypeHeight = useAppStore((state) => state.applyTypeHeight);
  const [draft, setDraft] = useState(() => draftOf(box));
  const [error, setError] = useState<SizeError | null>(null);
  const labelId = useId();
  const errorId = useId();
  const typeHeight = FURNITURE_DEFAULTS[box.type].h;

  const save = () => {
    const size = parseSize(draft);
    if (!size) return setError("notNumber");
    const result = resizeBox(box.id, size);
    if (!result.ok) return setError(result.reason);
    setDraft(draftOf({ ...box, ...size })); // "60.4" → "60"처럼 저장된 값으로 맞춘다
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") {
      setDraft(draftOf(box));
      setError(null);
    }
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
            onChange={(value) => {
              setDraft({ ...draft, [key]: value });
              setError(null);
            }}
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
      {box.h !== typeHeight && (
        <Button className={styles.typeHeight} onClick={() => applyTypeHeight(box.id)}>
          기본 높이 {typeHeight}cm로
        </Button>
      )}
    </div>
  );
}
