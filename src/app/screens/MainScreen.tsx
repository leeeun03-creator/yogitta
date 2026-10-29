import { Pencil } from "lucide-react";
import { SpaceScene } from "@/features/scene3d";
import { SpaceSwitcher } from "@/features/spaces";
import { Button, Logo } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import canvasStyles from "./CanvasArea.module.css";
import styles from "./MainScreen.module.css";
import { useFocusOnShow } from "./useFocusOnShow";

const ICON_SIZE = 18;

/** 물건을 찾는 메인 화면 (시안 01): 머리(로고 · 공간 · [편집]) → 3D 공간. [편집]을 누르면 편집 모드로 간다. */
export function MainScreen() {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const setMode = useAppStore((state) => state.setMode);
  const titleRef = useFocusOnShow<HTMLHeadingElement>();
  if (!space) return null;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
          <Logo />
        </h1>
        <SpaceSwitcher name={space.name} />
        <Button
          className={styles.edit}
          icon={<Pencil size={ICON_SIZE} aria-hidden="true" />}
          onClick={() => setMode("edit")}
        >
          편집
        </Button>
      </header>
      {/* TODO(T25-3): 검색창, TODO(T9): 가구 상세 패널 */}
      <main className={styles.body}>
        <section className={canvasStyles.canvas} aria-label="3D 공간 영역">
          <SpaceScene space={space} />
        </section>
      </main>
    </div>
  );
}
