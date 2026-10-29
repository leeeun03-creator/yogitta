import { Pencil } from "lucide-react";
import { useState } from "react";
import { SpaceScene } from "@/features/scene3d";
import { SpaceSwitcher } from "@/features/spaces";
import { Button, Logo, SearchBar } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import canvasStyles from "./CanvasArea.module.css";
import styles from "./MainScreen.module.css";
import { useFocusOnShow } from "./useFocusOnShow";

const ICON_SIZE = 18;

/**
 * 물건을 찾는 메인 화면 (시안 01·02): 머리(로고 · 공간 · [편집]) → 검색창 → 3D 공간. [편집]을 누르면 편집 모드로 간다.
 * 휴대폰에서는 [편집]이 아이콘 버튼이 된다.
 */
export function MainScreen() {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const setMode = useAppStore((state) => state.setMode);
  const titleRef = useFocusOnShow<HTMLHeadingElement>();
  const [query, setQuery] = useState(""); // TODO(T10): 검색어로 물건 찾기
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
          <span className={styles.editText}>편집</span>
        </Button>
      </header>
      {/* TODO(T9): 가구 상세 패널 */}
      <main className={styles.body}>
        <SearchBar value={query} onChange={setQuery} />
        <section className={canvasStyles.canvas} aria-label="3D 공간 영역">
          <SpaceScene space={space} />
        </section>
      </main>
    </div>
  );
}
