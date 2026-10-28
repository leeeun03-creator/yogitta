import { useRef } from "react";
import { FloorSizeCard } from "@/features/spaces";
import { Logo } from "@/shared/ui";
import { EmptyCard } from "./EmptyCard";
import styles from "./EmptyScreen.module.css";

/** 공간이 하나도 없을 때 보이는 첫 실행 화면 (시안 03). */
export function EmptyScreen() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  // 바닥 크기 카드는 처음부터 보이고, 새 공간 만들기 버튼은 그 카드의 이름 칸으로 데려간다
  const focusNameInput = () => {
    nameInputRef.current?.scrollIntoView({ block: "center" });
    nameInputRef.current?.focus();
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <Logo />
      </header>
      <main className={styles.main}>
        <EmptyCard onCreate={focusNameInput} />
        <FloorSizeCard nameInputRef={nameInputRef} />
      </main>
    </div>
  );
}
