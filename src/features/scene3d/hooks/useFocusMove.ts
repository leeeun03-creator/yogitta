import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useEffectEvent, useRef } from "react";
import { FOCUS } from "@/shared/constants/scene";
import type { Box } from "@/shared/types";
import { lerpView, type CameraLimits, type CameraView } from "../logic/cameraView";
import { easeOut } from "../logic/easeOut";
import { focusView } from "../logic/focusView";
import { prefersReducedMotion } from "./prefersReducedMotion";

/** 카메라를 옮길 가구와, 확대 정도를 그대로 둘지(가구를 눌렀을 때는 돌기만 하고 당기지 않는다). */
export type CameraFocus = { box: Box; keepZoom: boolean };

/** 카메라를 옮기는 데 필요한 것: 지금 자리 읽기, 옮기기, 움직였다고 표시하기, 화각, 움직임 범위. */
type FocusCamera = {
  read: () => CameraView | null;
  moveTo: (view: CameraView) => void;
  markMoved: () => void; // 화면 크기가 바뀌어도 처음 자리로 되돌리지 않게
  lens: { fovDeg: number; aspect: number };
  limits: CameraLimits;
};
type Move = { from: CameraView; to: CameraView; startedAt: number; last: CameraView };

const MOVED_CM = 1; // 옮기는 중 카메라가 이만큼 넘게 달라졌으면 누군가 움직인 것이다

/** 카메라에서 보는 곳까지 거리 (지금 확대 정도). */
const distanceOf = ({ position, target }: CameraView) =>
  Math.hypot(...position.map((value, index) => value - (target[index] ?? value)));

const isElsewhere = (a: CameraView, b: CameraView) =>
  Math.hypot(...a.position.map((value, index) => value - (b.position[index] ?? value))) > MOVED_CM;

/**
 * 볼 가구(focus)가 생기거나 다른 가구로 바뀌면 카메라를 그 가구 정면으로 FOCUS.moveMs 동안 옮긴다(T15).
 * 검색으로 찾은 가구는 가구에 맞춰 당기고, 누르거나 목록에서 고른 가구는 지금 확대 정도 그대로 돌기만 한다.
 * 같은 가구를 계속 보는 동안(물건을 고쳐 데이터가 바뀌어도)은 다시 움직이지 않아, 사용자가 돌려 둔 카메라를 지킨다.
 * 옮기는 중에 처음 보기·확대·끌기로 카메라가 움직이면 옮기기를 멈춘다. 동작 줄이기 설정이면 바로 옮긴다.
 */
export function useFocusMove(focus: CameraFocus | undefined, camera: FocusCamera) {
  const move = useRef<Move | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const start = useEffectEvent(() => {
    const from = camera.read();
    if (!focus || !from) return;
    const to = focusView(
      focus.box,
      camera.lens,
      camera.limits,
      focus.keepZoom ? distanceOf(from) : undefined,
    );
    camera.markMoved();
    if (prefersReducedMotion()) {
      camera.moveTo(to);
      return;
    }
    move.current = { from, to, startedAt: performance.now(), last: from };
    invalidate();
  });
  const boxId = focus?.box.id;
  useEffect(() => {
    if (boxId) start();
  }, [boxId]);
  useFrame(() => {
    const current = move.current;
    const now = camera.read();
    if (!current || !now) return;
    if (isElsewhere(now, current.last)) {
      move.current = null; // 누군가 카메라를 움직였다
      return;
    }
    const t = Math.min(1, (performance.now() - current.startedAt) / FOCUS.moveMs);
    camera.moveTo(lerpView(current.from, current.to, easeOut(t))); // 옮길 때마다 다시 그리게 한다
    current.last = camera.read() ?? now; // 바닥 안으로 당겨졌으면 그 자리
    if (t >= 1) move.current = null;
  });
}
