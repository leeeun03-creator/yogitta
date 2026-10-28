import styles from "./Segmented.module.css";

type SegmentedOption<T extends string> = { value: T; label: string };
type SegmentedProps<T extends string> = {
  label: string; // 묶음 이름 (화면에는 안 보이고 읽어 주기용)
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** 세그먼트 컨트롤 (컴포넌트 시안 06). 알약 안의 버튼 중 하나만 고른다. 터치 영역 44px. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
