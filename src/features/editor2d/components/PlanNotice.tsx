import styles from "./FloorPlan.module.css";

/**
 * 2D 평면도 위쪽 가운데에 잠깐 뜨는 안내. 안내가 없어도 알림 자리(role="status")는 남겨 둬서
 * 새 안내가 뜨면 화면 읽기 프로그램이 읽는다.
 */
export function PlanNotice({ text }: { text: string | null }) {
  return (
    <p role="status" className={styles.notice}>
      {text}
    </p>
  );
}
