import { useState, type FormEvent, type Ref } from "react";
import { DEFAULT_FLOOR, FLOOR_PRESETS } from "@/shared/constants/floor";
import { CM_PER_M } from "@/shared/constants/units";
import type { Floor } from "@/shared/types";
import { Button, TextField } from "@/shared/ui";
import { useCreateSpace } from "../hooks/useCreateSpace";
import { formatMeters } from "../logic/formatMeters";
import type { MetersError } from "../logic/parseMeters";
import { validateNewSpace, type NameError } from "../logic/validateNewSpace";
import styles from "./FloorSizeCard.module.css";

const DEFAULT_NAME = "내 방";

const NAME_MESSAGES: Record<NameError, string> = {
  empty: "공간 이름을 적어 주세요",
  duplicate: "이미 같은 이름의 공간이 있어요",
};
const METERS_MESSAGES: Record<MetersError, string> = {
  empty: "크기를 적어 주세요",
  notNumber: "숫자로 적어 주세요 (예: 6.0)",
  tooSmall: "1m 이상으로 적어 주세요",
  tooLarge: "30m 이하로 적어 주세요",
};

type FloorSizeCardProps = { nameInputRef?: Ref<HTMLInputElement> };

/** 새 공간의 이름과 바닥 크기를 정하는 카드 (시안 03 오른쪽). */
export function FloorSizeCard({ nameInputRef }: FloorSizeCardProps) {
  const { existingNames, createSpace } = useCreateSpace();
  const [name, setName] = useState(DEFAULT_NAME);
  const [width, setWidth] = useState(formatMeters(DEFAULT_FLOOR.w));
  const [depth, setDepth] = useState(formatMeters(DEFAULT_FLOOR.h));

  const result = validateNewSpace({ name, width, depth }, existingNames);
  const errors = result.ok ? {} : result.errors;
  const isPreset = (floor: Floor) =>
    width === formatMeters(floor.w) && depth === formatMeters(floor.h);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (result.ok) createSpace(result.name, result.floor);
  };

  return (
    <section className={styles.card} aria-labelledby="floor-size-title">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.heading}>
          <span className={styles.step}>1단계 / 새 공간</span>
          <h2 id="floor-size-title" className={styles.title}>
            바닥 크기를 정해요
          </h2>
          <p className={styles.description}>
            이 크기가 그대로 3D 바닥이 돼요. 나중에 바꿀 수 있어요.
          </p>
        </div>

        <TextField
          ref={nameInputRef}
          label="공간 이름"
          value={name}
          onChange={setName}
          error={errors.name && NAME_MESSAGES[errors.name]}
        />
        <div className={styles.sizeRow}>
          <TextField
            label="가로 (m)"
            inputMode="decimal"
            value={width}
            onChange={setWidth}
            error={errors.width && METERS_MESSAGES[errors.width]}
          />
          <TextField
            label="세로 (m)"
            inputMode="decimal"
            value={depth}
            onChange={setDepth}
            error={errors.depth && METERS_MESSAGES[errors.depth]}
          />
        </div>

        <div className={styles.presets} role="group" aria-label="바닥 크기 빠른 선택">
          <span className={styles.presetsLabel}>빠른 선택</span>
          {FLOOR_PRESETS.map(({ label, floor }) => (
            <button
              key={label}
              type="button"
              className={styles.preset}
              aria-pressed={isPreset(floor)}
              onClick={() => {
                setWidth(formatMeters(floor.w));
                setDepth(formatMeters(floor.h));
              }}
            >
              {label} {floor.w / CM_PER_M}×{floor.h / CM_PER_M}
            </button>
          ))}
        </div>

        <Button type="submit" variant="primary" className={styles.submit} disabled={!result.ok}>
          벽 그리러 가기
        </Button>
      </form>
    </section>
  );
}
