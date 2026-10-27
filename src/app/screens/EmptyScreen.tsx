import { House, Plus } from "lucide-react";
import { Button } from "@/shared/ui";
import styles from "./EmptyScreen.module.css";

const ICON_SIZE = 20;
const ADD_ICON_SIZE = 44;
const SAMPLE_HINT_ID = "sample-space-hint";

/** 공간이 하나도 없을 때 보이는 첫 실행 화면 (시안 03). */
export function EmptyScreen() {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.logoTile} aria-hidden="true">
          <House size={ICON_SIZE} strokeWidth={2} />
        </span>
        <span className={styles.logoText}>요깃따</span>
      </header>

      <main className={styles.main}>
        <section className={styles.emptyCard} aria-labelledby="empty-title">
          {/* TODO(T2-4): 바닥 크기 입력 카드로 이어 준다 */}
          <button type="button" className={styles.addTile} aria-label="새 공간 만들기">
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
            <Button variant="primary">새 공간 만들기</Button>
            <Button disabled aria-describedby={SAMPLE_HINT_ID}>
              샘플 공간 둘러보기
            </Button>
          </div>
          {/* TODO(T11): 샘플 공간이 생기면 버튼을 켠다 */}
          <p id={SAMPLE_HINT_ID} className={styles.hint}>
            샘플 공간은 준비 중이에요.
          </p>
        </section>
      </main>
    </div>
  );
}
