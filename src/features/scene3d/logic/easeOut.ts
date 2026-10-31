const EASE_POWER = 3; // 빠르게 움직이다 끝에서 천천히 멈춘다 (ease-out cubic)

/** 애니메이션 진행(t: 0~1)을 끝에서 느려지게 바꾼다. 칸 열림·카메라 이동이 같이 쓴다. */
export function easeOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - (1 - clamped) ** EASE_POWER;
}
