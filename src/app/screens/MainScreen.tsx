import { Pencil } from "lucide-react";
import { Button, Logo } from "@/shared/ui";
import { useAppStore } from "@/store/useAppStore";
import styles from "./MainScreen.module.css";
import { useFocusOnShow } from "./useFocusOnShow";

const ICON_SIZE = 18;

/** 물건을 찾는 메인 화면 (시안 01). [편집]을 누르면 편집 모드로 간다. */
export function MainScreen() {
  const setMode = useAppStore((state) => state.setMode);
  const titleRef = useFocusOnShow<HTMLHeadingElement>();
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
          <Logo />
        </h1>
        {/* TODO(T25-2): 공간 이름 알약 */}
        <Button
          className={styles.edit}
          icon={<Pencil size={ICON_SIZE} aria-hidden="true" />}
          onClick={() => setMode("edit")}
        >
          편집
        </Button>
      </header>
      {/* TODO(T25-2): 3D 공간, TODO(T25-3): 검색창 */}
      <main className={styles.body} />
    </div>
  );
}
