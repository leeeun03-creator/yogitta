import { HistoryButtons } from "@/features/editor2d";
import { formatMeters } from "@/shared/lib/formatMeters";
import type { Space } from "@/shared/types";
import { Segmented } from "@/shared/ui";
import { useAppStore, type EditView } from "@/store/useAppStore";
import styles from "./EditTopBar.module.css";

const VIEW_OPTIONS: readonly { value: EditView; label: string }[] = [
  { value: "plan", label: "2D 평면도" },
  { value: "preview", label: "3D 미리보기" },
];

/** 편집 모드 상단 바: 제목 · 공간 이름과 바닥 크기 · [2D 평면도 | 3D 미리보기] · 되돌리기·다시하기. */
export function EditTopBar({ space }: { space: Space }) {
  const view = useAppStore((state) => state.ui.view);
  const setView = useAppStore((state) => state.setView);
  return (
    // TODO(T25): ‹ 완료 버튼, TODO(T11): 자동 저장됨
    <header className={styles.topBar}>
      <div className={styles.heading}>
        <h1 className={styles.title}>편집 모드</h1>
        <span className={styles.spaceInfo}>
          {space.name} · {formatMeters(space.floor.w)} × {formatMeters(space.floor.h)} m
        </span>
      </div>
      <div className={styles.controls}>
        <Segmented label="보기 전환" options={VIEW_OPTIONS} value={view} onChange={setView} />
        <HistoryButtons />
      </div>
    </header>
  );
}
