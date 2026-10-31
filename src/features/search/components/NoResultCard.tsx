import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { ItemAddForm } from "@/features/items";
import { josa } from "@/shared/lib/josa";
import type { Box } from "@/shared/types";
import { Button } from "@/shared/ui";
import styles from "./ResultCard.module.css";

const ADD_ICON_SIZE = 18;

type NoResultCardProps = { query: string; boxes: readonly Box[] }; // boxes: 지금 공간의 가구 (넣을 곳)

/**
 * 결과 없음 카드 (시안 07): "아직 어딨는지 몰라요"와 "'선크림'은 등록된 위치가 없어요. 지금 등록할까요?" + [+ 물건 넣기].
 * "요깃따!"는 쓰지 않는다. [+ 물건 넣기]는 검색어가 이름에 채워진 입력을 열고, 넣으면 검색 결과 카드로 바뀐다.
 * 지금 공간에 가구가 없으면 [편집]에서 가구를 놓으라고만 안내한다.
 */
export function NoResultCard({ query, boxes }: NoResultCardProps) {
  const titleId = useId();
  const [isAdding, setIsAdding] = useState(false);
  const name = query.trim();
  const [first] = boxes;
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.unknown}>
        아직 어딨는지 몰라요
      </h2>
      <p className={styles.ask} aria-live="polite">
        <strong>&apos;{name}&apos;</strong>
        {josa(name, "은/는")} 등록된 위치가 없어요.{" "}
        {first ? "지금 등록할까요?" : "[편집]에서 가구를 놓으면 넣을 수 있어요."}
      </p>
      {first &&
        (isAdding ? (
          <ItemAddForm box={first} boxes={boxes} name={name} onClose={() => setIsAdding(false)} />
        ) : (
          <Button
            variant="primary"
            icon={<Plus size={ADD_ICON_SIZE} aria-hidden="true" />}
            onClick={() => setIsAdding(true)}
          >
            물건 넣기
          </Button>
        ))}
    </section>
  );
}
