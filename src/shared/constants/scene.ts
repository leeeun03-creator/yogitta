/** 벽 두께 (cm). 2D 평면도의 벽 선 굵기이자 3D 벽 박스 두께 (T4). */
export const WALL_THICKNESS_CM = 12;
/** 3D 벽 높이 (cm). 실제(240cm)보다 낮게 잘라 안이 보이게 한다 (컷어웨이, yogitta-design 5장). */
export const WALL_HEIGHT_CM = 110;
/** 3D 미리보기 카메라 세로 화각 (도). 좁게 잡아 등각에 가까운 디오라마처럼 보이게 한다. */
export const PREVIEW_FOV_DEG = 30;
/** 처음 카메라가 바닥 가운데를 내려다보는 방향 (오른쪽 앞 대각선 위, 크기는 상관없음). */
export const CAMERA_DIRECTION = { x: 1, y: 1, z: 1 } as const;
/** 처음 화면에 바닥이 꽉 차지 않게 두는 여유 (배). */
export const CAMERA_FIT_MARGIN = 1.1;
/** 3D 격자선을 바닥보다 살짝 띄우는 높이 (cm). 바닥 면과 겹쳐 깜빡이지 않게 한다. */
export const FLOOR_GRID_LIFT_CM = 0.5;
/** 3D 바닥에 구역 색을 까는 높이 (cm). 바닥보다 위, 격자선보다 아래라 격자선이 구역 위에 보인다 (T5). */
export const ROOM_FLOOR_LIFT_CM = 0.25;
/** 3D 카메라가 바닥 가운데(보는 곳)에 다가갈 수 있는 가장 가까운 거리 (cm). 가구 하나가 화면에 찰 정도. */
export const CAMERA_MIN_DISTANCE_CM = 200;
/** 카메라 자리·거리가 이만큼(cm) 안에서 다르면 같은 자리로 본다 (소수 오차). */
export const CAMERA_SAME_CM = 1;
/** 3D 카메라가 물러날 수 있는 가장 먼 거리 = 처음 거리의 몇 배. */
export const CAMERA_MAX_DISTANCE_RATIO = 2.5;
/** 3D 카메라가 위에서 내려다보는 각도의 끝 (도, 0 = 바로 위, 90 = 바닥 높이). 바닥 아래로 돌아가지 않게 한다. */
export const CAMERA_MAX_POLAR_DEG = 80;
/** 확대·축소 버튼을 한 번 누를 때 거리가 바뀌는 배수. */
export const CAMERA_ZOOM_STEP = 1.25;
/**
 * 3D 가구 정면의 손잡이 홈 (cm). 정면 위쪽에 가로로 긴 얇은 막대를 붙여 어느 쪽이 정면인지 보이게 한다.
 * 폭은 가구 가로의 widthRatio배(최대 maxWidth), 높이 자리는 가구 높이의 heightRatio배, 정면에서 depth만큼 나온다.
 */
export const BOX_HANDLE_3D = {
  widthRatio: 0.4,
  maxWidth: 20,
  height: 3,
  heightRatio: 0.8,
  depth: 1,
} as const;
/** 3D 이름 라벨을 가구 맨 위(침대는 머리판 위)에서 띄우는 높이 (cm). */
export const BOX_LABEL_GAP_CM = 12;
/**
 * 3D 이름 라벨이 쓰는 z-index 범위 [가까운 쪽, 먼 쪽]. 카메라에 가까운 라벨이 위에 오고,
 * 모두 보기 버튼(z-index 2)보다 아래라 버튼을 가리지 않는다.
 */
export const BOX_LABEL_Z_RANGE: [number, number] = [1, 0];
/** 3D 점 목록(Float32Array)에서 점 하나가 차지하는 칸 수: x, y, z. */
export const XYZ_PER_POINT = 3;

/** 위치 표시 때 찾은 칸이 정면으로 빠져나오는 거리 (cm, yogitta-design 5장)와 걸리는 시간 (ms). */
export const SLOT_OPEN_CM = 26;
export const SLOT_OPEN_MS = 300;

/** 칸 위 핀: 핀이 시작하는 점(열린 칸·가구 맨 위)에서 라벨까지 선 높이 (cm). */
export const PIN_RISE_CM = 50;
/** 바닥 점선 원(핑): 가구 바깥에서 안쪽 원까지 띄운 거리, 두 원 사이, 점선 길이·틈 (cm), 바깥 원 불투명도. */
export const PING = {
  inset: 15,
  gap: 20,
  dash: 8,
  space: 6,
  outerOpacity: 0.4,
  lift: 0.5,
} as const; // lift: 바닥에서 띄운 높이(겹쳐 깜빡이지 않게)
export const CIRCLE_SEGMENTS = 64; // 원을 몇 조각 선으로 그리나
export const FOUND_LINE_PX = 2; // 핀 선·점선 원 굵기 (화면 px)

/**
 * 찾은 가구로 카메라를 옮길 때 (T15): 정면에서 옆으로 돌린 각도, 내려다보는 각도 (도), 가구를 감싸는 구에 둘 여유 (배),
 * 옮겨 가는 시간 (ms). 정면에서 조금 비스듬히 봐야 칸의 깊이(빠져나온 칸)가 보인다.
 */
export const FOCUS = { yawDeg: 25, elevationDeg: 35, margin: 1.6, moveMs: 600 } as const;
