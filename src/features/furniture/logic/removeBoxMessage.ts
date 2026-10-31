type RemoveCounts = {
  itemCount: number; // 지울 가구에 든 물건 수
  stackedCount: number; // 그 위에 올린 가구 수 (두 층 포함)
  canMove: boolean; // 물건을 옮길 다른 가구가 있는지
};

/**
 * 가구 삭제 확인 설명 (PRD 인수 조건 "가구 삭제"). 물건이 들었으면 물건이 어떻게 되는지 말하고,
 * 위에 올린 가구가 있으면 그 수를 앞에 붙인다 (T29-4).
 */
export function removeBoxMessage({ itemCount, stackedCount, canMove }: RemoveCounts): string {
  const stacked = stackedCount > 0 ? `위에 올려 둔 가구가 ${stackedCount}개 있어요. ` : "";
  if (itemCount === 0) return `${stacked}바닥으로 내리거나 같이 지울 수 있어요`;
  const items = canMove
    ? "다른 가구의 칸 없음으로 옮기거나 같이 지울 수 있어요"
    : "가구를 지우면 물건도 같이 지워져요";
  return `${stacked}물건 ${itemCount}개가 들어 있어요. ${items}`;
}
