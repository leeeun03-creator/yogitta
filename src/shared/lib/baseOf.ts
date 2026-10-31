import type { Box } from "@/shared/types";

/**
 * 가구 위 가구의 받침 가구 (T29). parentId가 없거나(바닥, null) 받침 가구를 찾을 수 없으면 undefined.
 * 끄는 중인 자리(parentId가 null일 수 있다)에도 쓴다.
 */
export function baseOf(box: { parentId?: string | null }, boxes: readonly Box[]): Box | undefined {
  const { parentId } = box;
  return parentId ? boxes.find((other) => other.id === parentId) : undefined;
}
