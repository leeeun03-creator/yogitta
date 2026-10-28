import { FLOOR_PRESETS } from "@/shared/constants/floor";
import { CM_PER_M } from "@/shared/constants/units";
import type { Floor } from "@/shared/types";
import { formatMeters } from "../logic/formatMeters";
import styles from "./FloorPresets.module.css";

type FloorPresetsProps = { width: string; depth: string; onSelect: (floor: Floor) => void };

/** 바닥 크기 빠른 선택 칩 (원룸·투룸·아파트). 지금 입력값과 같은 칩이 눌린 상태로 보인다. */
export function FloorPresets({ width, depth, onSelect }: FloorPresetsProps) {
  return (
    <div className={styles.presets} role="group" aria-label="바닥 크기 빠른 선택">
      <span className={styles.label}>빠른 선택</span>
      {FLOOR_PRESETS.map(({ label, floor }) => (
        <button
          key={label}
          type="button"
          className={styles.preset}
          aria-pressed={width === formatMeters(floor.w) && depth === formatMeters(floor.h)}
          onClick={() => onSelect(floor)}
        >
          {label} {floor.w / CM_PER_M}×{floor.h / CM_PER_M}
        </button>
      ))}
    </div>
  );
}
