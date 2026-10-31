import { useState } from "react";
import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import type { ElevationError } from "../logic/elevationMessage";
import { parseCm } from "../logic/parseCm";

/**
 * 벽걸이 설치 높이 입력칸의 글자와 막힌 까닭 (T30-3). save는 글자를 높이로 읽어 바꾸고(숫자가 아니거나 막히면
 * 까닭만 남긴다), cancel은 지금 높이로 돌린다. 글자를 고치면 까닭은 지운다.
 */
export function useElevationDraft(box: Pick<Box, "id" | "elevation">) {
  const changeElevation = useAppStore((state) => state.changeElevation);
  const saved = String(box.elevation);
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState<ElevationError | null>(null);
  const save = () => {
    if (draft === saved) return;
    const elevation = parseCm(draft);
    if (elevation === null) return setError("notNumber");
    const result = changeElevation(box.id, elevation);
    if (!result.ok) setError(result.reason);
  };
  const cancel = () => {
    setDraft(saved);
    setError(null);
  };
  const change = (value: string) => {
    setDraft(value);
    setError(null);
  };
  return { draft, error, save, cancel, change };
}
