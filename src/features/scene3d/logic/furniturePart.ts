type Xyz = [number, number, number];

/** 3D 가구 부품 하나 (가구 로컬 cm: x 가로, y 가구 아랫면부터 높이, z 깊이 · +z가 정면). */
export type FurniturePart = {
  key: string;
  position: Xyz; // 가운데
  size: Xyz; // 가로(x)·높이(y)·깊이(z)
  color: string;
  hasEdges: boolean; // 모서리 선 (손잡이처럼 작은 것은 빼서 지저분하지 않게)
};

/** 두 모서리(from = 작은 쪽, to = 큰 쪽) 사이를 채우는 부품. */
export function partBetween(
  key: string,
  from: Xyz,
  to: Xyz,
  look: Pick<FurniturePart, "color" | "hasEdges">,
): FurniturePart {
  const [x0, y0, z0] = from;
  const [x1, y1, z1] = to;
  return {
    key,
    position: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    size: [x1 - x0, y1 - y0, z1 - z0],
    ...look,
  };
}
