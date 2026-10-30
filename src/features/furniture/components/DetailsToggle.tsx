import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./PropertyPanel.module.css";

const ICON_SIZE = 16;

type DetailsToggleProps = { isExpanded: boolean; controls: string; onToggle: () => void };

/** 휴대폰에서 속성 패널의 종류·크기를 접었다 펴는 버튼. 데스크톱은 늘 펼쳐 있어 숨긴다. */
export function DetailsToggle({ isExpanded, controls, onToggle }: DetailsToggleProps) {
  const Icon = isExpanded ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      className={styles.detailsToggle}
      aria-expanded={isExpanded}
      aria-controls={controls}
      onClick={onToggle}
    >
      종류·크기
      <Icon size={ICON_SIZE} aria-hidden="true" />
    </button>
  );
}
