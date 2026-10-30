import { Plus } from "lucide-react";
import { SAMPLE_DATA } from "@/features/storage";
import { Button } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import styles from "./EmptyCard.module.css";

const ADD_ICON_SIZE = 44;

type EmptyCardProps = { onCreate: () => void };

/** 공간이 없다는 안내와 새 공간 만들기·샘플 공간 둘러보기 (시안 03 왼쪽). */
export function EmptyCard({ onCreate }: EmptyCardProps) {
  const loadData = useAppStore((state) => state.loadData);
  return (
    <section className={styles.card} aria-labelledby="empty-title">
      <button
        type="button"
        className={styles.addTile}
        aria-label="새 공간 만들기"
        onClick={onCreate}
      >
        <Plus size={ADD_ICON_SIZE} strokeWidth={2} />
      </button>
      <h1 id="empty-title" className={styles.title}>
        아직 공간이 없어요
      </h1>
      <p className={styles.description}>
        바닥 크기부터 정하고,
        <br />
        벽을 그려서 내 방을 만들어 보세요.
      </p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={onCreate}>
          새 공간 만들기
        </Button>
        <Button onClick={() => loadData(SAMPLE_DATA)}>샘플 공간 둘러보기</Button>
      </div>
    </section>
  );
}
