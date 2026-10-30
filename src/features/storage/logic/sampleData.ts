import { FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import { DATA_VERSION } from "@/shared/constants/storage";
import type { AppData, Box, FurnitureType, Item, Space } from "@/shared/types";

/** 샘플 가구 하나: 종류 기본값(높이·칸 수·설치 높이)에 자리·크기·물건만 정한다. 위치·크기는 cm. */
type SampleBox = {
  id: string;
  name: string;
  type: FurnitureType;
  at: [x: number, z: number, rotation: number];
  size: [w: number, d: number];
  items?: Item[];
};

function sampleBox({ id, name, type, at, size, items = [] }: SampleBox): Box {
  const [x, z, rotation] = at;
  const [w, d] = size;
  return { id, name, type, x, z, rotation, w, d, ...FURNITURE_DEFAULTS[type], items };
}

/** 바닥 테두리를 따라 세운 사각형 벽. */
const roomWalls = (id: string, w: number, h: number): Space["walls"] => [
  {
    id,
    tool: "rect",
    closed: true,
    points: [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h },
    ],
  },
];

/** 내 방 (6.0 × 4.5 m 원룸): 가운데 구역 선으로 침실·작업 공간을 나눈다. 정면은 회전 0이면 2D 아래쪽이다. */
const MY_ROOM: Space = {
  id: "sample_space_1",
  name: "내 방",
  floor: { w: 600, h: 450 },
  rooms: ["침실", "작업 공간"],
  roomLines: [
    {
      id: "sample_roomLine_1",
      points: [
        { x: 330, y: 0 },
        { x: 330, y: 450 },
      ],
    },
  ],
  roomAnchors: { 침실: { x: 150, y: 250 }, "작업 공간": { x: 470, y: 250 } },
  walls: roomWalls("sample_wall_1", 600, 450),
  boxes: [
    sampleBox({
      id: "sample_box_1",
      name: "침대",
      type: "bed",
      at: [75, 115, 0],
      size: [110, 200],
      items: [{ id: "sample_item_1", name: "겨울 이불", slot: 1, memo: "압축팩에 넣어 둠" }],
    }),
    sampleBox({
      id: "sample_box_2",
      name: "화장대 서랍장",
      type: "drawer",
      at: [190, 35, 0],
      size: [80, 45],
      items: [
        { id: "sample_item_2", name: "선글라스", slot: 0 },
        { id: "sample_item_3", name: "여권", slot: 1, memo: "파란 파우치 안" },
        { id: "sample_item_4", name: "비상금", slot: 1 },
        { id: "sample_item_5", name: "양말", slot: 2 },
      ],
    }),
    sampleBox({
      id: "sample_box_3",
      name: "옷장",
      type: "cabinet",
      at: [75, 410, 180],
      size: [110, 60],
      items: [
        { id: "sample_item_6", name: "겨울 코트", slot: 0 },
        { id: "sample_item_7", name: "여행 가방", slot: 7, memo: "기내용" },
      ],
    }),
    sampleBox({
      id: "sample_box_4",
      name: "책상",
      type: "desk",
      at: [500, 42, 0],
      size: [120, 60],
      items: [{ id: "sample_item_8", name: "보조배터리", slot: 0, memo: "충전 케이블과 같이" }],
    }),
    sampleBox({
      id: "sample_box_5",
      name: "책장",
      type: "shelf",
      at: [400, 425, 180],
      size: [80, 30],
      items: [
        { id: "sample_item_9", name: "보드게임", slot: 2 },
        { id: "sample_item_10", name: "공구함", slot: 3 },
      ],
    }),
    sampleBox({
      id: "sample_box_6",
      name: "보관함",
      type: "box",
      at: [530, 415, 180],
      size: [60, 40],
      items: [{ id: "sample_item_11", name: "크리스마스 장식" }],
    }),
  ],
};

/** 형 방 (3.6 × 3.0 m): 여권이 내 방에도 있어 "다른 공간에도 있어요"를 볼 수 있다. */
const BROTHER_ROOM: Space = {
  id: "sample_space_2",
  name: "형 방",
  floor: { w: 360, h: 300 },
  rooms: [],
  walls: roomWalls("sample_wall_2", 360, 300),
  boxes: [
    sampleBox({
      id: "sample_box_7",
      name: "형 책상",
      type: "desk",
      at: [70, 40, 0],
      size: [110, 55],
      items: [{ id: "sample_item_12", name: "여권", slot: 0, memo: "형 여권" }],
    }),
    sampleBox({
      id: "sample_box_8",
      name: "형 침대",
      type: "bed",
      at: [290, 115, 0],
      size: [100, 200],
    }),
    sampleBox({
      id: "sample_box_9",
      name: "서랍장",
      type: "drawer",
      at: [70, 270, 180],
      size: [70, 40],
      items: [
        { id: "sample_item_13", name: "충전기", slot: 0 },
        { id: "sample_item_14", name: "이어폰", slot: 1 },
      ],
    }),
  ],
};

/** 처음 열 때 보여 주는 샘플 공간 (PRD US11): 내 방(원룸, 구역 둘)과 형 방. 처음 여는 공간은 내 방이다. */
export const SAMPLE_DATA: AppData = {
  version: DATA_VERSION,
  spaces: [MY_ROOM, BROTHER_ROOM],
  currentSpaceId: MY_ROOM.id,
};
