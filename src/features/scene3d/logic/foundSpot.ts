/**
 * 3D에 위치 표시할 찾은 물건 하나 (검색 결과). 어느 가구·칸에 있는지와 핀 라벨 글자,
 * 고른 결과인지(고른 결과만 가구를 주황으로 칠하고 칸을 연다).
 */
export type FoundSpot = {
  itemId: string;
  boxId: string;
  slot?: number; // 칸 번호, 없으면 칸 없음
  itemName: string; // 핀 라벨 첫 줄 ("여권")
  place: string; // 핀 라벨 둘째 줄 ("화장대 서랍장 · 2번째 서랍")
  isPicked: boolean;
};
