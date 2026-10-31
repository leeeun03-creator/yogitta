import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { FurniturePanel } from "@/features/items";
import { SpaceScene } from "@/features/scene3d";
import { foundSpots, NoResultCard, ResultCard, useFoundItem, useSearch } from "@/features/search";
import { SpaceSwitcher } from "@/features/spaces";
import type { Space } from "@/shared/types";
import { Button, Logo, SearchBar } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import canvasStyles from "./CanvasArea.module.css";
import styles from "./MainScreen.module.css";
import { useCoverLeft } from "./useCoverLeft";
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

type SearchCardProps = {
  space: Space;
  search: ReturnType<typeof useSearch>;
  found: ReturnType<typeof useFoundItem>;
  onShowBox: () => void; // 휴대폰: 카드 대신 고른 가구의 가구 상세 패널을 본다
};

/** 검색 중 카드: 찾으면(다른 공간 포함) 검색 결과 카드, 못 찾으면 결과 없음 카드. */
function SearchCard({ space, search, found, onShowBox }: SearchCardProps) {
  if (search.matches.length === 0 && search.elsewhere.length === 0) {
    return <NoResultCard key={search.query} query={search.query} boxes={space.boxes} />;
  }
  return (
    <ResultCard
      query={search.query}
      matches={search.matches}
      picked={found.picked}
      onPick={found.pick}
      onShowBox={onShowBox}
      elsewhere={{ spaces: search.elsewhere, onGo: search.goToSpace }}
    />
  );
}

/**
 * 검색창 → [3D 공간 + 가구 상세 패널]. 검색하면 3D 공간 위 왼쪽에 카드가 뜬다(SearchCard). 찾으면 찾은 가구의 가구 상세
 * 패널이 열리고 3D에서 위치를 표시한다. 휴대폰은 카드가 가구 상세 패널 자리(3D 아래)에 뜨고, [가구 전체 보기]를 누르면
 * 그 검색어 동안은 카드 대신 패널을 본다.
 */
function MainBody({ space }: { space: Space }) {
  const search = useSearch();
  const found = useFoundItem(search.matches);
  const [panelQuery, setPanelQuery] = useState<string | null>(null); // 휴대폰: 카드 대신 패널을 볼 검색어
  const isPanelShown = panelQuery === search.query;
  const { isSearching, matches } = search;
  const { attachCard, coverLeft } = useCoverLeft(found.picked !== null && isSearching);
  const spots = useMemo(
    () => (isSearching ? foundSpots(matches, found.picked) : []),
    [isSearching, matches, found.picked],
  );
  return (
    <main className={styles.body}>
      <SearchBar value={search.query} onChange={search.setQuery} />
      <div
        className={
          search.isSearching && !isPanelShown ? `${styles.stage} ${styles.searching}` : styles.stage
        }
      >
        <section className={canvasStyles.canvas} aria-label="3D 공간 영역">
          {/* 공간을 바꾸면 3D 공간을 새로 만들어 카메라도 그 공간의 처음 자리에서 시작한다 */}
          <SpaceScene key={space.id} space={space} found={spots} coverLeft={coverLeft} />
        </section>
        {search.isSearching && (
          <div
            ref={attachCard}
            className={isPanelShown ? `${styles.result} ${styles.besidePanel}` : styles.result}
          >
            <SearchCard
              {...{ space, search, found }}
              onShowBox={() => setPanelQuery(search.query)}
            />
          </div>
        )}
        <FurniturePanel space={space} />
      </div>
    </main>
  );
}

/** 물건을 찾는 메인 화면 (시안 01·02): 머리(로고 · 공간 · [편집]) → 검색창 → [3D 공간 + 가구 상세 패널]. */
export function MainScreen() {
  const space = useAppStore((state) =>
    state.data.spaces.find((candidate) => candidate.id === state.data.currentSpaceId),
  );
  if (!space) return null;
  return (
    <div className={styles.screen}>
      <MainHeader />
      <MainBody space={space} />
    </div>
  );
}
