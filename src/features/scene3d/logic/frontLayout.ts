import { PART_CM } from "@/shared/constants/furnitureParts";

/** 정면에 문·서랍 앞판을 단 가구의 깊이 나눔 (가구 로컬 z, +z가 정면). */
export type FrontLayout = {
  bodyFront: number; // 몸통 앞면
  frontFace: number; // 문·서랍 앞판 앞면 (손잡이는 여기서 가구 앞면 d/2까지)
};

/**
 * 몸통 + 문·서랍 앞판 + 손잡이가 모두 가구 깊이 안에 들어가게 깊이를 나눈다.
 * 얇은 가구면 앞판·손잡이를 깊이의 1/4까지로 줄인다.
 */
export function frontLayout(depth: number, handleDepth: number): FrontLayout {
  const handle = Math.min(handleDepth, depth / 4);
  const front = Math.min(PART_CM.front, depth / 4);
  const frontFace = depth / 2 - handle;
  return { bodyFront: frontFace - front, frontFace };
}
