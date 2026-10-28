import {
  FloorPlan,
  HistoryButtons,
  SnapToggle,
  ToolBar,
  useHistoryKeys,
} from "@/features/editor2d";
import { formatMeters } from "@/shared/lib/formatMeters";
import { useAppStore } from "@/store/useAppStore";
import styles from "./EditScreen.module.css";

/** 벽·가구를 만들고 고치는 편집 모드 (시안 04). 속성 패널은 T6부터 붙인다. */
export function EditScreen() {
  useHistoryKeys();
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  if (!space) return null;

  return (
    <div className={styles.screen}>
      {/* TODO(T25): ‹ 완료 버튼, TODO(T11): 자동 저장됨 */}
      <header className={styles.topBar}>
        <h1 className={styles.title}>편집 모드</h1>
        <span className={styles.spaceInfo}>
          {space.name} · {formatMeters(space.floor.w)} × {formatMeters(space.floor.h)} m
        </span>
        {/* TODO(T4): 2D 평면도 / 3D 미리보기 전환 */}
        <HistoryButtons />
      </header>
      <main className={styles.body}>
        <ToolBar />
        <section className={styles.canvas} aria-label="2D 평면도 영역">
          <div className={styles.plan}>
            <FloorPlan floor={space.floor} walls={space.walls} />
          </div>
          {/* TODO(T5): 왼쪽 구역 목록, TODO(T26): 바닥 크기 버튼 */}
          <footer className={styles.canvasBar}>
            <SnapToggle />
          </footer>
        </section>
      </main>
    </div>
  );
}
