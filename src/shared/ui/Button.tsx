import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "add" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode; // 글자 앞에 붙는 선 아이콘
  ref?: Ref<HTMLButtonElement>;
};

/** 알약형 버튼. 상태(올림·누름·비활성·포커스) 색은 컴포넌트 시안 06을 따른다. */
export function Button({
  variant = "secondary",
  icon,
  children,
  className,
  type = "button",
  ref,
  ...rest
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(" ");
  return (
    <button ref={ref} type={type} className={classNames} {...rest}>
      {icon}
      {children}
    </button>
  );
}
