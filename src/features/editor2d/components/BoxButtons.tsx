import type { KeyboardEvent } from "react";
import { GRID_SNAP_CM } from "@/shared/constants/grid";
import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { boxKeyStep } from "../logic/boxKeyStep";
import { boxScreenRect } from "../logic/boxScreenRect";
import type { ViewBox } from "../logic/fitViewBox";
import styles from "./FloorPlan.module.css";

type BoxButtonsProps = { boxes: readonly Box[]; selected: string | null; view: ViewBox };

/**
 * 키보드·화면 읽기 프로그램으로 가구를 고르고 옮기는 버튼. 가구 자리에 투명하게 겹쳐 두고(누르기·끌기는 2D 평면도가 받는다),
 * Tab으로 초점을 옮기면 가구에 테두리가 보인다. Enter·Space로 고르고, 방향키로 격자 한 칸(스냅을 끄면 1cm)씩 옮기고, Esc로 푼다.
 */
export function BoxButtons({ boxes, selected, view }: BoxButtonsProps) {
  const moveBox = useAppStore((state) => state.moveBox);
  const selectBox = useAppStore((state) => state.selectBox);
  const step = useAppStore((state) => (state.ui.snap ? GRID_SNAP_CM : 1));

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, box: Box) => {
    const direction = boxKeyStep(event.key);
    const isDeselect = event.key === "Escape" && selected !== null;
    if (!direction && !isDeselect) return;
    // 방향키가 2D 평면도까지 가서 화면이 같이 움직이지 않게 여기서 멈춘다
    event.preventDefault();
    event.stopPropagation();
    if (!direction) {
      selectBox(null);
      return;
    }
    moveBox(box.id, { x: box.x + direction.x * step, y: box.z + direction.y * step });
    selectBox(box.id);
  };

  return (
    <div className={styles.boxButtons}>
      {boxes.map((box) => {
        const rect = boxScreenRect(box, view);
        return (
          <button
            key={box.id}
            type="button"
            className={styles.boxButton}
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            aria-label={box.name}
            aria-pressed={box.id === selected}
            onClick={() => selectBox(box.id)}
            onKeyDown={(event) => handleKeyDown(event, box)}
          />
        );
      })}
    </div>
  );
}
