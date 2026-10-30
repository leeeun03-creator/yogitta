import type { PointerEvent, TouchEvent } from "react";

/**
 * 2D 평면도를 누를 때의 초점 처리기 (2D 평면도 틀에 붙인다).
 * - 누르면 터치도 마우스처럼 2D 평면도로 초점을 옮긴다: 속성 패널 입력칸(가구 이름)이 초점을 잃어
 *   저장되고 화면 키보드가 닫힌다. 누를 때라서 그 뒤에 뜨는 구역 이름 입력칸의 초점은 뺏지 않는다
 * - 터치를 뗀 뒤 브라우저가 흉내 내는 마우스 누르기가 2D 평면도로 초점을 가져가지 않게 한다
 *   (구획을 눌러 뜬 이름 입력칸의 초점을 뺏지 않게). 끌기 뒤처럼 취소할 수 없는 때는 건드리지 않는다
 */
export const pressFocusHandlers = {
  onPointerDownCapture: (event: PointerEvent<HTMLElement>) =>
    event.currentTarget.focus({ preventScroll: true }),
  onTouchEnd: (event: TouchEvent<HTMLElement>) => {
    if (event.cancelable) event.preventDefault();
  },
};
