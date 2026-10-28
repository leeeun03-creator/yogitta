import { House } from "lucide-react";
import styles from "./Logo.module.css";

const ICON_SIZE = 20;

/** 강조색 집 아이콘 타일 + "요깃따" 글자. 첫 실행 화면·메인 화면 머리에 쓴다. */
export function Logo() {
  return (
    <span className={styles.logo}>
      <span className={styles.tile} aria-hidden="true">
        <House size={ICON_SIZE} strokeWidth={2} />
      </span>
      <span className={styles.text}>요깃따</span>
    </span>
  );
}
