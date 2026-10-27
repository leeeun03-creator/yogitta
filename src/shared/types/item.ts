/** 사용자가 칸에 넣은 물건. 좌표 없이 가구(Box)에 속한다. */
export type Item = {
  id: string;
  name: string; // 자유 입력
  slot?: number; // 칸 번호, 없으면 칸 없음
  memo?: string;
};
