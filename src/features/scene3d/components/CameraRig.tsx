import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { PREVIEW_FOV_DEG } from "@/shared/constants/scene";
import type { Floor } from "@/shared/types";
import { startCamera } from "../logic/startCamera";

/** 바닥 크기와 화면 비율에 맞춰 카메라를 처음 자리에 둔다. 회전·줌·이동은 T4-4에서 붙인다. */
export function CameraRig({ floor }: { floor: Floor }) {
  const get = useThree((state) => state.get);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  // three.js 카메라는 바꿔 쓰는 객체라 effect 안에서 꺼내 고친다
  useLayoutEffect(() => {
    const { camera, invalidate } = get();
    const start = startCamera(floor, PREVIEW_FOV_DEG, width / height);
    camera.position.set(...start.position);
    camera.near = start.near;
    camera.far = start.far;
    camera.lookAt(...start.target);
    camera.updateProjectionMatrix();
    invalidate(); // 카메라를 옮겼으니 한 번 다시 그린다
  }, [get, floor, width, height]);

  return null;
}
