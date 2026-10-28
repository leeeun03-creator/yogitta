import { Eraser, MousePointer2, Slash, Square, Waypoints, type LucideIcon } from "lucide-react";
import { useAppStore, type DrawingTool } from "@/store/useAppStore";
import styles from "./ToolBar.module.css";

const ICON_SIZE = 20;

const TOOLS: readonly { tool: DrawingTool; label: string; Icon: LucideIcon }[] = [
  { tool: "select", label: "선택", Icon: MousePointer2 },
  { tool: "line", label: "직선", Icon: Slash },
  { tool: "polyline", label: "연속선", Icon: Waypoints },
  { tool: "rect", label: "사각형", Icon: Square },
  { tool: "eraser", label: "지우개", Icon: Eraser },
];

/** 편집 모드 왼쪽 그리기 도구 막대 (컴포넌트 시안 08). 한 번에 도구 하나만 고른다. */
export function ToolBar() {
  const current = useAppStore((state) => state.ui.tool);
  const setTool = useAppStore((state) => state.setTool);

  return (
    <div className={styles.bar} role="toolbar" aria-label="그리기 도구">
      {TOOLS.map(({ tool, label, Icon }) => (
        <button
          key={tool}
          type="button"
          className={styles.tool}
          aria-pressed={current === tool}
          onClick={() => setTool(tool)}
        >
          <Icon size={ICON_SIZE} strokeWidth={2} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}
