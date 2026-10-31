import { NotebookPen } from "lucide-react";
import { useId } from "react";
import { Button } from "@/shared/ui";
import type { SpaceCount } from "../logic/countBySpace";
import type { ItemMatch } from "../logic/matchItems";
import { LocationSentence } from "./LocationSentence";
import styles from "./ResultCard.module.css";

const MEMO_ICON_SIZE = 16;

type ResultCardProps = {
  query: string;
  matches: readonly ItemMatch[];
  picked: ItemMatch | null; // 고른 결과 (가구 상세 패널에 열린 가구)
  onPick: (match: ItemMatch) => void;
  onShowBox: () => void; // 휴대폰: 카드 대신 고른 가구의 가구 상세 패널을 본다
  elsewhere: { spaces: readonly SpaceCount[]; onGo: (spaceId: string) => void }; // 다른 공간 결과와 그 공간으로 가기
};

/**
 * 검색 결과 카드 (시안 07 "찾음"): "요깃따!"와 "'여권' 1곳 찾음", 위치 문장, 메모, 다른 공간 링크. 여러 곳이면 위치 문장을
 * 번호 목록으로 보이고 눌러서 고른다. 지금 공간에 없고 다른 공간에만 있으면 그 공간 링크만 보인다.
 * "요깃따!"는 찾았을 때만 쓴다. 찾은 개수는 글자를 쓰는 대로 화면 읽기 프로그램이 읽는다.
 * 휴대폰은 가구 상세 패널 자리를 쓰므로 [가구 전체 보기]로 그 가구의 칸을 본다 (시안 02).
 */
export function ResultCard(props: ResultCardProps) {
  const { query, matches, picked, onPick, onShowBox, elsewhere } = props;
  const titleId = useId();
  const elsewhereCount = elsewhere.spaces.reduce((sum, { count }) => sum + count, 0);
  if (!picked && elsewhereCount === 0) return null;
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.found}>
          요깃따!
        </h2>
        <p className={styles.count} aria-live="polite">
          &apos;{query.trim()}&apos;{" "}
          {picked ? `${matches.length}곳 찾음` : `다른 공간에서 ${elsewhereCount}곳 찾음`}
        </p>
      </div>
      {picked && matches.length === 1 && <SingleResult match={picked} />}
      {picked && matches.length > 1 && (
        <ResultList matches={matches} picked={picked} onPick={onPick} />
      )}
      {elsewhere.spaces.length > 0 && <ElsewhereLinks {...elsewhere} isOnlyThere={!picked} />}
      {picked && (
        <Button variant="primary" className={styles.showBox} onClick={onShowBox}>
          {picked.box.name} 전체 보기
        </Button>
      )}
    </section>
  );
}

type ElsewhereLinksProps = ResultCardProps["elsewhere"] & { isOnlyThere: boolean };

/** 다른 공간 링크: "다른 공간에도 있어요: 형 방 1곳 ›". 누르면 그 공간으로 바뀌고 검색어는 그대로다. */
function ElsewhereLinks({ spaces, onGo, isOnlyThere }: ElsewhereLinksProps) {
  return (
    <p className={styles.elsewhere}>
      {isOnlyThere ? "다른 공간에 있어요:" : "다른 공간에도 있어요:"}
      {spaces.map(({ space, count }) => (
        <button key={space.id} type="button" className={styles.link} onClick={() => onGo(space.id)}>
          {space.name} {count}곳 ›
        </button>
      ))}
    </p>
  );
}

/** 1곳: 위치 문장과 메모. */
function SingleResult({ match }: { match: ItemMatch }) {
  return (
    <>
      <p className={styles.single}>
        <LocationSentence match={match} />
      </p>
      {match.item.memo && (
        <p className={styles.memo}>
          <NotebookPen size={MEMO_ICON_SIZE} aria-hidden="true" />
          {match.item.memo}
        </p>
      )}
    </>
  );
}

type ResultListProps = Pick<ResultCardProps, "matches" | "picked" | "onPick">;

/** 여러 곳: 번호 붙은 결과 행. 누르면 그 결과를 고른다(고른 행은 찾은 칸 배경). */
function ResultList({ matches, picked, onPick }: ResultListProps) {
  return (
    <ol className={styles.list}>
      {matches.map((match) => (
        <li key={match.item.id}>
          <button
            type="button"
            className={styles.row}
            aria-pressed={match === picked}
            onClick={() => onPick(match)}
          >
            <LocationSentence match={match} />
          </button>
        </li>
      ))}
    </ol>
  );
}
