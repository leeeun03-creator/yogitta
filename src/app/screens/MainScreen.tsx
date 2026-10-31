import { Pencil } from "lucide-react";
import { FurniturePanel } from "@/features/items";
import { SpaceScene } from "@/features/scene3d";
import { ResultCard, useSearch } from "@/features/search";
import { SpaceSwitcher } from "@/features/spaces";
import { Button, Logo, SearchBar } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import canvasStyles from "./CanvasArea.module.css";
import styles from "./MainScreen.module.css";
import { useFocusOnShow } from "./useFocusOnShow";

const ICON_SIZE = 18;

/** 머리: 로고 · 공간 알약 · [편집] (휴대폰은 [편집]이 아이콘 버튼). */
function MainHeader() {
  const setMode = useAppStore((state) => state.setMode);
  const titleRef = useFocusOnShow<HTMLHeadingElement>();
  return (
    <header className={styles.header}>
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        <Logo />
      </h1>
      <SpaceSwitcher />
      <Button
        className={styles.edit}
        icon={<Pencil size={ICON_SIZE} aria-hidden="true" />}
        onClick={() => setMode("edit")}
      >
        <span className={styles.editText}>편집</span>
      </Button>
    </header>
  );
}

/**
 * 물건을 찾는 메인 화면 (시안 01·02): 머리 → 검색창 → [3D 공간 + 가구 상세 패널]. 검색해서 찾으면 검색 결과 카드가
 * 3D 공간 위 왼쪽에 뜨고, 휴대폰은 가구 상세 패널 자리(3D 아래)에 뜬다.
 */
export function MainScreen() {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  const search = useSearch();
  if (!space) return null;
  const hasCard = search.isSearching && search.matches.length > 0;
  return (
    <div className={styles.screen}>
      <MainHeader />
      <main className={styles.body}>
        <SearchBar value={search.query} onChange={search.setQuery} />
        <div className={hasCard ? `${styles.stage} ${styles.searching}` : styles.stage}>
          <section className={canvasStyles.canvas} aria-label="3D 공간 영역">
            {/* 공간을 바꾸면 3D 공간을 새로 만들어 카메라도 그 공간의 처음 자리에서 시작한다 */}
            <SpaceScene key={space.id} space={space} />
          </section>
          {hasCard && (
            <div className={styles.result}>
              <ResultCard query={search.query} matches={search.matches} />
            </div>
          )}
          <FurniturePanel space={space} />
        </div>
      </main>
    </div>
  );
}
