import { useState, type FormEvent } from "react";
import { formatMeters } from "@/shared/lib/formatMeters";
import type { Floor } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { parseMeters, type MetersError } from "../logic/parseMeters";

type Errors = { width?: MetersError; depth?: MetersError; isOutside?: boolean };

/**
 * 바닥 크기 바꾸기 입력(가로·세로 m)과 틀린 까닭. submit은 두 칸을 검사해 바닥을 바꾸고,
 * 줄여서 벽·구역 선·가구가 바닥 밖으로 나가면 바꾸지 않고 isOutside를 남긴다. 바꾸면 onDone을 부른다.
 */
export function useFloorResizeForm(floor: Floor, onDone: () => void) {
  const resizeFloor = useAppStore((state) => state.resizeFloor);
  const [width, setWidth] = useState(formatMeters(floor.w));
  const [depth, setDepth] = useState(formatMeters(floor.h));
  const [errors, setErrors] = useState<Errors>({});
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const w = parseMeters(width);
    const h = parseMeters(depth);
    if (!w.ok || !h.ok) {
      setErrors({ width: w.ok ? undefined : w.reason, depth: h.ok ? undefined : h.reason });
      return;
    }
    const result = resizeFloor({ w: w.cm, h: h.cm });
    if (result.ok) onDone();
    else setErrors({ isOutside: true });
  };
  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    setErrors({});
  };
  return {
    fields: { width, depth },
    setWidth: edit(setWidth),
    setDepth: edit(setDepth),
    errors,
    submit,
  };
}
