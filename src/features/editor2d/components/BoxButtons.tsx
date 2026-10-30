import type { KeyboardEvent } from "react";
import { GRID_SNAP_CM } from "@/shared/constants/grid";
import type { Box } from "@/shared/types";
import { useAppStore } from "@/store/useAppStore";
import { boxKeyAction, type BoxKeyAction } from "../logic/boxKeyAction";
import { boxKeyMove } from "../logic/boxKeyMove";
import { boxScreenRect } from "../logic/boxScreenRect";
import type { ViewBox } from "../logic/fitViewBox";
import styles from "./BoxOverlay.module.css";

type BoxButtonsProps = {
  boxes: readonly Box[];
  selected: string | null;
  view: ViewBox;
  onRemoved: () => void; // 초점이 있던 가구를 지운 뒤 (초점을 2D 평면도로 돌린다)
};

/** 초점이 있는 가구에 키보드 동작을 한다. 방향키·R은 그 가구를 고른 채로 둔다. 방향키는 벽·다른 가구를 뚫지 않는다. */
function useBoxKeys(selected: string | null, onRemoved: () => void) {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const moveBox = useAppStore((state) => state.moveBox);
  const rotateBox = useAppStore((state) => state.rotateBox);
  const removeBox = useAppStore((state) => state.removeBox);
  const selectBox = useAppStore((state) => state.selectBox);
  const step = useAppStore((state) => (state.ui.snap ? GRID_SNAP_CM : 1));
  return (action: BoxKeyAction, box: Box) => {
    if (action.type === "deselect") {
      selectBox(null);
      return;
    }
    if (action.type === "remove") {
      removeBox(box.id);
      onRemoved();
      return;
    }
    if (action.type === "rotate") rotateBox(box.id);
    else if (space) moveBox(box.id, boxKeyMove(box, action.direction, step, space));
    if (selected !== box.id) selectBox(box.id);
  };
}

/**
 * 키보드·화면 읽기 프로그램으로 가구를 고르고 고치는 버튼. 가구 자리에 투명하게 겹쳐 두고(누르기·끌기는 2D 평면도가 받는다),
 * Tab으로 초점을 옮기면 가구에 테두리가 보인다. Enter·Space로 고르고, 방향키로 격자 한 칸(스냅을 끄면 1cm)씩 옮기고,
 * R로 돌리고, Delete로 지우고, Esc로 푼다.
 */
export function BoxButtons({ boxes, selected, view, onRemoved }: BoxButtonsProps) {
  const selectBox = useAppStore((state) => state.selectBox);
  const act = useBoxKeys(selected, onRemoved);
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, box: Box) => {
    const action = boxKeyAction(event);
    if (!action || (action.type === "deselect" && selected === null)) return;
    // 방향키가 2D 평면도까지 가서 화면이 같이 움직이지 않게 여기서 멈춘다
    event.preventDefault();
    event.stopPropagation();
    act(action, box);
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
