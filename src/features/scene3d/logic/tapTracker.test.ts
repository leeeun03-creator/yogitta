import { describe, expect, it, vi } from "vitest";
import { TAP_MOVE_PX } from "@/shared/constants/pointer";
import { tapTracker, type TapEvent } from "./tapTracker";

const at = (x: number, y = 0, more: Partial<TapEvent> = {}): TapEvent => ({
  pointerId: 1,
  clientX: x,
  clientY: y,
  isPrimary: true,
  button: 0,
  ...more,
});

function track() {
  const onTap = vi.fn();
  return { onTap, tracker: tapTracker(onTap) };
}

describe("tapTracker", () => {
  it("누른 자리에서 떼면 누르기다", () => {
    const { onTap, tracker } = track();
    tracker.pointerdown(at(10, 10));
    tracker.pointerup(at(10, 10));
    expect(onTap).toHaveBeenCalledWith(at(10, 10));
  });

  it("엣지: TAP_MOVE_PX까지 움직이면 누르기, 넘으면 끌기다", () => {
    const { onTap, tracker } = track();
    tracker.pointerdown(at(0));
    tracker.pointermove(at(TAP_MOVE_PX));
    tracker.pointerup(at(TAP_MOVE_PX));
    expect(onTap).toHaveBeenCalledTimes(1);
    tracker.pointerdown(at(0));
    tracker.pointerup(at(TAP_MOVE_PX + 1));
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("엣지: 끌어 돌렸다가 제자리로 돌아와 떼도 누르기가 아니다", () => {
    const { onTap, tracker } = track();
    tracker.pointerdown(at(0));
    tracker.pointermove(at(60));
    tracker.pointermove(at(0));
    tracker.pointerup(at(0));
    expect(onTap).not.toHaveBeenCalled();
  });

  it("엣지: 두 번째 손가락이 닿으면(확대) 첫 손가락을 떼도 누르기가 아니다", () => {
    const { onTap, tracker } = track();
    tracker.pointerdown(at(0));
    tracker.pointerdown(at(100, 0, { pointerId: 2, isPrimary: false }));
    tracker.pointerup(at(100, 0, { pointerId: 2, isPrimary: false }));
    tracker.pointerup(at(0));
    expect(onTap).not.toHaveBeenCalled();
  });

  it("엣지: 다른 포인터의 움직임·떼기, 오른쪽 버튼, 누르지 않고 떼기는 누르기가 아니다", () => {
    const { onTap, tracker } = track();
    tracker.pointerup(at(0));
    tracker.pointerdown(at(0, 0, { button: 2 }));
    tracker.pointerup(at(0, 0, { button: 2 }));
    tracker.pointerdown(at(0));
    tracker.pointermove(at(60, 0, { pointerId: 2 }));
    tracker.pointerup(at(0, 0, { pointerId: 2 }));
    expect(onTap).not.toHaveBeenCalled();
  });
});
