import styles from "./App.module.css";

/** 화면을 조립하는 최상위 컴포넌트. 메인 화면 ↔ 편집 모드 전환은 T25에서 붙인다. */
export function App() {
  return (
    <main className={styles.app}>
      <h1 className={styles.logo}>요깃따</h1>
      <p className={styles.notice}>공간 만들기 화면을 준비하고 있어요.</p>
    </main>
  );
}
