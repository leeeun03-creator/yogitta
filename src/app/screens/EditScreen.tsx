import { FloorPlan, SnapToggle, ToolBar, useHistoryKeys } from "@/features/editor2d";
import { ScenePreview } from "@/features/scene3d";
import { useAppStore } from "@/store/useAppStore";
import styles from "./EditScreen.module.css";
import { EditTopBar } from "./EditTopBar";

/** 벽·가구를 만들고 고치는 편집 모드 (시안 04). 속성 패널은 T6부터 붙인다. */
export function EditScreen() {
  useHistoryKeys();
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const view = useAppStore((state) => state.ui.view);
  if (!space) return null;

  return (
    <div className={styles.screen}>
      <EditTopBar space={space} />
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
            <ScenePreview floor={space.floor} walls={space.walls} />
          </section>
        )}
      </main>
    </div>
  );
}
