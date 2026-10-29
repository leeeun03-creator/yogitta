import { Search, X } from "lucide-react";
import { useId, useRef } from "react";
import styles from "./SearchBar.module.css";

const ICON_SIZE = 22;
const CLEAR_ICON_SIZE = 18;

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * 알약형 검색창 (컴포넌트 시안 07). 라벨 "물건 검색"은 화면에 안 보이고 화면 읽기 프로그램만 읽는다.
 * 글자가 있으면 지우기 버튼이 나오고, 지우면 다시 검색창에 초점을 둔다.
 */
export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const clear = () => {
    onChange("");
    inputRef.current?.focus();
  };
  return (
    // 검색은 글자를 쓰는 대로 한다(T10). Enter로 폼을 보내 페이지가 다시 열리지 않게 막는다
    <form role="search" className={styles.bar} onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={inputId} className={styles.label}>
        물건 검색
      </label>
      <Search className={styles.icon} size={ICON_SIZE} aria-hidden="true" />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        className={styles.input}
        placeholder="무엇을 찾고 있나요?"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value !== "" && (
        <button type="button" className={styles.clear} aria-label="검색어 지우기" onClick={clear}>
          <X size={CLEAR_ICON_SIZE} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
