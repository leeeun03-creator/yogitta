import { Fragment } from "react";
import { buildLocationSentence } from "../logic/buildLocationSentence";
import type { ItemMatch } from "../logic/matchItems";
import styles from "./ResultCard.module.css";

/** 위치 문장 한 줄. 물건·공간 이름은 굵게, 가구 이름은 굵게 + 강조색 (시안 07). */
export function LocationSentence({ match }: { match: ItemMatch }) {
  const parts = buildLocationSentence({
    item: match.item,
    box: match.box,
    spaceName: match.space.name,
  });
  return (
    <p className={styles.sentence}>
      {parts.map((part, index) =>
        part.mark ? (
          <strong key={index} className={part.mark === "box" ? styles.boxName : undefined}>
            {part.text}
          </strong>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </p>
  );
}
