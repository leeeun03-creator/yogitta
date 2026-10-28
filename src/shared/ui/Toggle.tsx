import styles from "./Toggle.module.css";

type ToggleProps = { label: string; checked: boolean; onChange: (checked: boolean) => void };

/** 켬·끔 토글 (컴포넌트 시안 06). 라벨까지 눌러도 되고 Space·Enter로도 바뀐다. 터치 영역 44px. */
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles.toggle}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </button>
  );
}
