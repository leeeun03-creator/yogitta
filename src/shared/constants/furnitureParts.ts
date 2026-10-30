/**
 * 3D 가구 부품 크기 (cm 고정값). 비율로 하면 큰 가구가 어색해져서 고정값으로 둔다 (기획서 3.4).
 * 가구가 이보다 작으면 부품을 만드는 쪽에서 가구 크기에 맞춰 줄인다.
 */
export const PART_CM = {
  board: 2, // 판 두께 (옆판·뒤판·위아래 판·선반 판)
  front: 1.5, // 문·서랍 앞판 두께
  gap: 1, // 문 두 짝 사이·서랍 앞판 사이 틈
  drawerHandle: { width: 12, height: 2, depth: 2 }, // 서랍 손잡이 (가로로 긴)
  doorHandle: { width: 2, height: 16, depth: 2 }, // 문 손잡이 (세로로 긴)
  tableTop: 3, // 책상·테이블 상판 두께
  leg: 5, // 다리 굵기 (네모 기둥)
  legInset: 3, // 다리를 상판 가장자리에서 들인 만큼
  mattress: 20, // 매트리스 두께 (침대 높이에서 이만큼이 매트리스, 아래는 프레임)
  mattressInset: 3, // 매트리스를 프레임 가장자리에서 들인 만큼
  headboardRise: 40, // 머리판이 침대 높이(매트리스 윗면)보다 위로 올라온 만큼
} as const;
