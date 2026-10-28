import {
  FloorPlan,
  HistoryButtons,
  SnapToggle,
  ToolBar,
  useHistoryKeys,
} from "@/features/editor2d";
import { ScenePreview } from "@/features/scene3d";
import { formatMeters } from "@/shared/lib/formatMeters";
import { Segmented } from "@/shared/ui";
import { useAppStore, type EditView } from "@/store/useAppStore";
import styles from "./EditScreen.module.css";

const VIEW_OPTIONS: readonly { value: EditView; label: string }[] = [
  { value: "plan", label: "2D 평면도" },
  { value: "preview", label: "3D 미리보기" },
];

/** 벽·가구를 만들고 고치는 편집 모드 (시안 04). 속성 패널은 T6부터 붙인다. */
export function EditScreen() {
  useHistoryKeys();
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const view = useAppStore((state) => state.ui.view);
  const setView = useAppStore((state) => state.setView);
  if (!space) return null;

  return (
    <div className={styles.screen}>
      {/* TODO(T25): ‹ 완료 버튼, TODO(T11): 자동 저장됨 */}
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
      <main className={styles.body}>
        <ToolBar />
        {view === "plan" ? (
          <section className={styles.canvas} aria-label="2D 평면도 영역">
            <div className={styles.plan}>
              <FloorPlan floor={space.floor} walls={space.walls} />
            </div>
            {/* TODO(T5): 왼쪽 구역 목록, TODO(T26): 바닥 크기 버튼 */}
            <footer className={styles.canvasBar}>
              <SnapToggle />
            </footer>
          </section>
        ) : (
          <section className={styles.canvas} aria-label="3D 미리보기 영역">
            <ScenePreview floor={space.floor} />
          </section>
        )}
      </main>
    </div>
  );
}
