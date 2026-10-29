import styles from "./SpaceSwitcher.module.css";

/**
 * 메인 화면 머리의 공간 알약: "공간" 라벨 + 지금 공간 이름 (시안 01). 눌러서 다른 공간으로 바꾸는 공간 전환 목록은 T27에서 붙인다.
 * 그때까지는 누를 수 없는 표시라 버튼으로 만들지 않는다.
 */
export function SpaceSwitcher({ name }: { name: string }) {
  return (
    <p className={styles.switcher}>
      <span className={styles.label}>공간</span>
      <span className={styles.name}>{name}</span>
    </p>
  );
}
