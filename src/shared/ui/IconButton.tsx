import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.css";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string; // 글자가 없으니 이름(aria-label)은 꼭 있어야 한다
  icon: ReactNode;
  variant?: "ghost" | "outline"; // ghost = 투명형(기본), outline = 테두리형
};

/** 44×44 원형 아이콘 버튼. 투명형(상단 바·패널 안)과 테두리형(3D 위). 상태 색은 컴포넌트 시안 06을 따른다. */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const classNames = [styles.button, variant === "outline" && styles.outline, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} aria-label={label} title={label} className={classNames} {...rest}>
      {icon}
    </button>
  );
}
