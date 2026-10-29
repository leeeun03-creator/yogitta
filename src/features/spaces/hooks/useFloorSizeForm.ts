import { useState, type FormEvent } from "react";
import { DEFAULT_FLOOR } from "@/shared/constants/floor";
import type { Floor } from "@/shared/types";
import { formatMeters } from "@/shared/lib/formatMeters";
import { defaultSpaceName } from "../logic/defaultSpaceName";
import { validateNewSpace } from "../logic/validateNewSpace";
import { useCreateSpace } from "./useCreateSpace";

/** 바닥 크기 카드의 입력값·검사 결과·제출. 맞으면 공간을 만들고 편집 모드로 간다. */
export function useFloorSizeForm() {
  const { existingNames, createSpace } = useCreateSpace();
  // 처음 연 때의 공간들로 정한다 (카드를 연 뒤에 이름이 저절로 바뀌지 않게)
  const [name, setName] = useState(() => defaultSpaceName(existingNames));
  const [width, setWidth] = useState(formatMeters(DEFAULT_FLOOR.w));
  const [depth, setDepth] = useState(formatMeters(DEFAULT_FLOOR.h));

  const result = validateNewSpace({ name, width, depth }, existingNames);
  const selectFloor = (floor: Floor) => {
    setWidth(formatMeters(floor.w));
    setDepth(formatMeters(floor.h));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (result.ok) createSpace(result.name, result.floor);
  };

  return {
    fields: { name, width, depth },
    setters: { setName, setWidth, setDepth },
    errors: result.ok ? {} : result.errors,
    canSubmit: result.ok,
    selectFloor,
    submit,
  };
}
