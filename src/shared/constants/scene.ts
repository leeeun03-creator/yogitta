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
/** 3D 카메라가 바닥 가운데(보는 곳)에 다가갈 수 있는 가장 가까운 거리 (cm). 가구 하나가 화면에 찰 정도. */
export const CAMERA_MIN_DISTANCE_CM = 200;
/** 3D 카메라가 물러날 수 있는 가장 먼 거리 = 처음 거리의 몇 배. */
export const CAMERA_MAX_DISTANCE_RATIO = 2.5;
/** 3D 카메라가 위에서 내려다보는 각도의 끝 (도, 0 = 바로 위, 90 = 바닥 높이). 바닥 아래로 돌아가지 않게 한다. */
export const CAMERA_MAX_POLAR_DEG = 80;
/** 확대·축소 버튼을 한 번 누를 때 거리가 바뀌는 배수. */
export const CAMERA_ZOOM_STEP = 1.25;
