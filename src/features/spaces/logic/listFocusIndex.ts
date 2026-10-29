/**
 * 목록에서 키를 눌렀을 때 초점을 옮길 줄 번호. ↓·↑는 다음·앞 줄(끝에서는 처음·마지막으로 돈다),
 * Home·End는 처음·마지막. 지금 줄을 모르면(-1) ↓는 처음, ↑는 마지막. 목록을 움직이는 키가 아니거나 줄이 없으면 null.
 */
export function listFocusIndex(current: number, count: number, key: string): number | null {
  if (count === 0) return null;
  if (key === "ArrowDown") return (current + 1) % count;
  if (key === "ArrowUp") return current <= 0 ? count - 1 : current - 1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}
