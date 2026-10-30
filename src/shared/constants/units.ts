/** 데이터는 모두 cm로 저장하고, 바닥 크기만 화면에서 m로 보여준다. */
export const CM_PER_M = 100;
/** 도 → 라디안. 데이터의 각도(가구 회전 등)는 도로 두고 계산할 때만 바꾼다. */
export const DEG_TO_RAD = Math.PI / 180;
/** 벽·구역 선이 되려면 점이 이만큼은 있어야 한다 (선분 하나). 점 2개짜리 벽은 직선이다. */
export const LINE_MIN_POINTS = 2;
