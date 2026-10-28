import { useState, type FormEvent } from "react";
import { DEFAULT_FLOOR } from "@/shared/constants/floor";
import type { Floor } from "@/shared/types";
import { formatMeters } from "../logic/formatMeters";
import { validateNewSpace } from "../logic/validateNewSpace";
import { useCreateSpace } from "./useCreateSpace";

const DEFAULT_NAME = "내 방";

/** 바닥 크기 카드의 입력값·검사 결과·제출. 맞으면 공간을 만들고 편집 모드로 간다. */
export function useFloorSizeForm() {
  const { existingNames, createSpace } = useCreateSpace();
  const [name, setName] = useState(DEFAULT_NAME);
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
