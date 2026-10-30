import { useThree, type RootState } from "@react-three/fiber";
import { useEffect } from "react";
import { Raycaster, Vector2 } from "three";
import { pickedBoxId } from "../logic/pickedBoxId";
import { tapTracker } from "../logic/tapTracker";

type BoxPickerProps = { onPick: (id: string | null) => void }; // 누른 가구, 가구가 아닌 곳(바닥·빈 곳·벽)은 null

type Three = Pick<RootState, "gl" | "camera" | "scene">;

/** 화면 자리(event)를 지나는 첫 가구의 id. 다시 그리기 전에도 맞게 카메라 행렬을 먼저 맞춘다. */
function boxAt(event: PointerEvent, { gl, camera, scene }: Three): string | null {
  const rect = gl.domElement.getBoundingClientRect();
  const pointer = new Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new Raycaster();
  camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
  return pickedBoxId(raycaster.intersectObjects(scene.children, true).map((hit) => hit.object));
}

/**
 * 누른 자리(clientX·Y)에 있는 이름 라벨의 가구 id. 라벨은 위에서 끌어도 3D가 돌게 누르기를 받지 않으므로
 * (pointer-events: none) 라벨 사각형 안인지 직접 잰다.
 */
function labelBoxId(target: HTMLElement, { clientX: x, clientY: y }: PointerEvent): string | null {
  for (const label of target.querySelectorAll("[data-box-id]")) {
    const rect = label.getBoundingClientRect();
    const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (isInside) return label.getAttribute("data-box-id");
  }
  return null;
}

/**
 * 3D에서 가구 누르기. 누르기(끌기·확대가 아님, tapTracker)면 누른 자리를 지나는 첫 가구를 고른다(없으면 null).
 * 이름 라벨을 눌렀으면 그 가구다. 보기 버튼은 이 3D 영역 밖에 있어 누르기로 치지 않는다.
 * three.js 누르기 이벤트 대신 직접 재는 것은, 휴대폰에서 화면을 연 뒤 첫 터치가 눌리지 않아서다.
 */
export function BoxPicker({ onPick }: BoxPickerProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const connected = useThree((state) => state.events.connected);
  useEffect(() => {
    // 3D 그림과 이름 라벨(drei Html은 여기에 붙는다)을 함께 담은 곳
    const target = connected instanceof HTMLElement ? connected : null;
    if (!target) return;
    const tracker = tapTracker((event: PointerEvent) =>
      onPick(labelBoxId(target, event) ?? boxAt(event, { gl, camera, scene })),
    );
    const types = ["pointerdown", "pointermove", "pointerup"] as const;
    for (const type of types) target.addEventListener(type, tracker[type]);
    return () => {
      for (const type of types) target.removeEventListener(type, tracker[type]);
    };
  }, [gl, camera, scene, connected, onPick]);
  return null;
}
