/** 3D 물체 하나에서 가구 id를 찾는 데 필요한 것만 (three.js Object3D와 같은 모양). */
type Pickable = { userData: Record<string, unknown>; parent: Pickable | null };

/**
 * 누른 자리를 지나는 물체들(가까운 것부터) 중 처음 만나는 가구의 id. 가구 묶음(group)의 userData.boxId로 알아보고,
 * 벽·바닥처럼 가구가 아닌 물체는 건너뛴다 (벽에 가려진 가구도 눌린다). 가구가 없으면 null.
 */
export function pickedBoxId(hits: readonly Pickable[]): string | null {
  for (const hit of hits) {
    for (let node: Pickable | null = hit; node; node = node.parent) {
      const id = node.userData.boxId;
      if (typeof id === "string") return id;
    }
  }
  return null;
}
