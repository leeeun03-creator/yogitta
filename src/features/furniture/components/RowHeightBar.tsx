import { ROW_SUM_TOLERANCE_CM } from "@/shared/lib/rowHeightsOf";
import styles from "./RowHeightBar.module.css";

type RowHeightBarProps = {
  heights: readonly number[]; // 칸마다 높이 (cm, 위 칸부터, 입력 중인 값)
  totalCm: number; // 가구 전체 높이
  activeRow: number | null; // 입력 중인 칸
};

/**
 * 칸 비율 미리보기 막대 (시안 04, T30-2). 위 칸부터 칸 높이 비율대로 나누고 입력 중인 칸을 강조한다.
 * 합이 전체 높이보다 작으면 맨 아래에 빈 자리(점선)를 둔다. 같은 내용을 입력칸과 합계 줄이 말하므로 읽어 주지 않는다.
 */
export function RowHeightBar({ heights, totalCm, activeRow }: RowHeightBarProps) {
  const sum = heights.reduce((total, height) => total + height, 0);
  const scale = Math.max(sum, totalCm, 1);
  const empty = totalCm - sum;
  return (
    <div className={styles.bar} data-testid="row-bar" aria-hidden="true">
      {heights.map((height, row) => (
        <span
          key={row}
          className={row === activeRow ? `${styles.row} ${styles.active}` : styles.row}
          data-active={row === activeRow || undefined}
          style={{ flexGrow: height / scale }}
        />
      ))}
      {empty > ROW_SUM_TOLERANCE_CM && (
        <span className={styles.empty} style={{ flexGrow: empty / scale }} />
      )}
    </div>
  );
}
