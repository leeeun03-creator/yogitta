import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { PREVIEW_FOV_DEG } from "@/shared/constants/scene";
import { PerspectiveCamera } from "three";
import { filmOffsetFor } from "../logic/filmOffsetFor";

/** 3D 그림 전체를 오른쪽으로 shiftPx 옮긴다 (카메라 filmOffset, T15-2). 보는 곳·카메라 자리는 그대로다. */
export function useViewShift(shiftPx: number, screen: { width: number; height: number }) {
  const get = useThree((state) => state.get);
  const { width, height } = screen;
  // three.js 카메라는 바꿔 쓰는 객체라 effect 안에서 꺼내 고친다
  useLayoutEffect(() => {
    const { camera, invalidate } = get();
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.filmOffset = filmOffsetFor(
      shiftPx,
      { width, height },
      PREVIEW_FOV_DEG,
      camera.filmGauge,
    );
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, shiftPx, width, height]);
}
