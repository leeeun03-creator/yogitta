import { useId } from "react";
import type { Box } from "@/shared/types";
import { TextField } from "@/shared/ui";
import { useElevationDraft } from "../hooks/useElevationDraft";
import { draftKeys } from "../logic/draftKeys";
import { elevationMessage } from "../logic/elevationMessage";
import styles from "./BoxSizeFields.module.css";

/**
 * 벽걸이 설치 높이 입력칸 (cm, T30-3). Enter나 입력칸을 벗어나면 바꾸고, Esc면 지금 높이로 돌린다.
 * 숫자가 아니거나 막히는 높이(바닥보다 낮음·240cm를 넘음·다른 가구와 겹침)는 바꾸지 않고 까닭을 띄운다.
 * 설치 높이가 바뀌면 부르는 쪽에서 key로 새로 그린다.
 */
export function ElevationField({ box }: { box: Pick<Box, "id" | "elevation"> }) {
  const { draft, error, save, cancel, change } = useElevationDraft(box);
  const errorId = useId();
  const handleKeyDown = draftKeys(save, cancel);
  return (
    <div className={styles.field}>
      <TextField
        label="설치 높이 (cm)"
        value={draft}
        inputMode="decimal"
        invalid={error ? { describedBy: errorId } : undefined}
        onChange={change}
        onKeyDown={handleKeyDown}
        onBlur={save}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {elevationMessage(error)}
        </p>
      )}
    </div>
  );
}
