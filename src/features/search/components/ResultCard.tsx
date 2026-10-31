import { NotebookPen } from "lucide-react";
import { useId } from "react";
import type { ItemMatch } from "../logic/matchItems";
import { LocationSentence } from "./LocationSentence";
import styles from "./ResultCard.module.css";

const MEMO_ICON_SIZE = 16;

type ResultCardProps = { query: string; matches: readonly ItemMatch[] };

/**
 * 검색 결과 카드 (시안 07 "찾음"): "요깃따!"와 "'여권' 1곳 찾음", 위치 문장, 메모. 여러 곳이면 위치 문장을 번호 목록으로.
 * "요깃따!"는 찾았을 때만 쓴다. 찾은 개수는 글자를 쓰는 대로 화면 읽기 프로그램이 읽는다.
 */
export function ResultCard({ query, matches }: ResultCardProps) {
  const titleId = useId();
  const [first] = matches;
  if (!first) return null;
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.found}>
          요깃따!
        </h2>
        <p className={styles.count} aria-live="polite">
          &apos;{query.trim()}&apos; {matches.length}곳 찾음
        </p>
      </div>
      {matches.length === 1 ? (
        <>
          <LocationSentence match={first} />
          {first.item.memo && (
            <p className={styles.memo}>
              <NotebookPen size={MEMO_ICON_SIZE} aria-hidden="true" />
              {first.item.memo}
            </p>
          )}
        </>
      ) : (
        <ol className={styles.list}>
          {matches.map((match) => (
            <li key={match.item.id} className={styles.row}>
              <LocationSentence match={match} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
