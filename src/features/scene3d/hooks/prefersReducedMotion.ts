/** 사용자가 동작 줄이기를 켰는지. 켰으면 칸 열림·카메라 이동을 애니메이션 없이 바로 한다. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}
