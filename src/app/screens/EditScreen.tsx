import { FloorPlan, SnapToggle, ToolBar, useHistoryKeys } from "@/features/editor2d";
import { PropertyPanel, RemoveBoxDialog } from "@/features/furniture";
import { ScenePreview } from "@/features/scene3d";
import { FloorResizeButton, RoomList } from "@/features/spaces";
import { useAppStore } from "@/store/useAppStore";
import canvasStyles from "./CanvasArea.module.css";
import styles from "./EditScreen.module.css";
import { EditTopBar } from "./EditTopBar";

/** 벽·가구를 만들고 고치는 편집 모드 (시안 04): 그리기 도구 막대 · 2D 평면도(또는 3D 미리보기) · 속성 패널. */
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
          <section className={canvasStyles.canvas} aria-label="2D 평면도 영역">
            <div className={styles.plan}>
              <FloorPlan space={space} />
            </div>
            <footer className={styles.canvasBar}>
              <RoomList rooms={space.rooms} />
              <div className={styles.barControls}>
                <SnapToggle />
                <FloorResizeButton floor={space.floor} />
              </div>
            </footer>
          </section>
        ) : (
          <section className={canvasStyles.canvas} aria-label="3D 미리보기 영역">
            <ScenePreview space={space} />
          </section>
        )}
        <PropertyPanel />
        <RemoveBoxDialog />
      </main>
    </div>
  );
}
