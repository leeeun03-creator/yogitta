import type { Box } from "@/shared/types";
import { boxScreenRect } from "../logic/boxScreenRect";
import type { ViewBox } from "../logic/fitViewBox";
import { selectedLabelTop } from "../logic/selectedLabelTop";
import styles from "./FloorPlan.module.css";

type SelectedBoxLabelProps = { box: Box | undefined; view: ViewBox };

/**
 * 고른 가구 이름 알약 (시안 04). 가구 위에 띄우고, 위에 자리가 없으면 아래에 띄운다. 줌·이동·끌기를 따라간다.
 * 화면 읽기 프로그램에는 가구 버튼이 이름과 골라졌는지를 이미 알리므로 숨긴다.
 */
export function SelectedBoxLabel({ box, view }: SelectedBoxLabelProps) {
  if (!box) return null;
  const rect = boxScreenRect(box, view);
  return (
    <span
      data-testid="selected-box-label"
      className={styles.selectedBoxLabel}
      style={{ left: rect.left + rect.width / 2, top: selectedLabelTop(rect) }}
      aria-hidden="true"
    >
      {box.name}
    </span>
  );
}
