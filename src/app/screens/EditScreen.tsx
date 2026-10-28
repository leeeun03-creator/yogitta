import { FloorPlan, ToolBar } from "@/features/editor2d";
import { formatMeters } from "@/features/spaces";
import { useAppStore } from "@/store/useAppStore";
import styles from "./EditScreen.module.css";

/** 벽·가구를 만들고 고치는 편집 모드 (시안 04). 속성 패널은 T6부터 붙인다. */
export function EditScreen() {
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
      </header>
      <main className={styles.body}>
        <ToolBar />
        <section className={styles.canvas} aria-label="2D 평면도 영역">
          <FloorPlan floor={space.floor} walls={space.walls} />
        </section>
      </main>
    </div>
  );
}
