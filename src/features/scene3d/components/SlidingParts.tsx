import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { SLOT_OPEN_CM, SLOT_OPEN_MS } from "@/shared/constants/scene";
import { prefersReducedMotion } from "../hooks/prefersReducedMotion";
import { easeOut } from "../logic/easeOut";
import type { FurniturePart } from "../logic/furniturePart";
import { PartMesh, type Look } from "./PartMesh";

/**
 * 찾은 칸으로 빠져나오는 부품 묶음 (yogitta-design 5장 "칸 열림: 짧은 애니메이션"). 나타나면 SLOT_OPEN_MS 동안
 * 정면(+z)으로 SLOT_OPEN_CM 밀려 나온다. 바뀔 때만 그리는 3D라 움직이는 동안은 매 장면 다시 그리게 한다.
 */
export function SlidingParts({ parts, look }: { parts: readonly FurniturePart[]; look: Look }) {
  const group = useRef<Group>(null);
  const startedAt = useRef<number | null>(null);
  const isInstant = useRef(prefersReducedMotion());
  useFrame((state) => {
    const current = group.current;
    if (!current) return;
    startedAt.current ??= performance.now();
    const elapsed = performance.now() - startedAt.current;
    const progress = isInstant.current ? 1 : Math.min(1, elapsed / SLOT_OPEN_MS);
    current.position.z = easeOut(progress) * SLOT_OPEN_CM;
    if (progress < 1) state.invalidate();
  });
  return (
    <group ref={group}>
      {parts.map((part) => (
        <PartMesh key={part.key} part={part} look={look} />
      ))}
    </group>
  );
}
