import { describe, expect, it } from "vitest";
import { FURNITURE_DEFAULTS } from "@/shared/constants/furniture";
import { FURNITURE_TYPES, type Item } from "@/shared/types";
import { createBoxTestData } from "./boxFixtures";
import { changeBoxType } from "./changeBoxType";
import { deepFreeze } from "./spaceFixtures";

const boxOf = (data: ReturnType<typeof createBoxTestData>, index = 0) =>
  data.spaces[0]?.boxes[index];

describe("changeBoxType", () => {
  it("60 × 50 × 90cm 보관함을 서랍장으로 바꾸면 크기·자리는 그대로, 칸 수는 서랍장 기본값이다", () => {
    const original = createBoxTestData([{ x: 120, z: 80, rotation: 90 }]);
    const box = boxOf(changeBoxType(original, "box_1", "drawer"));
    expect(box).toMatchObject({ type: "drawer", x: 120, z: 80, rotation: 90, w: 60, d: 50 });
    expect(box).toMatchObject({ h: 90, rows: 3, cols: 1, elevation: 0 });
  });

  it("8종 모두 칸 수·설치 높이가 그 종류 기본값이 되고 크기는 그대로다", () => {
    for (const type of FURNITURE_TYPES.filter((candidate) => candidate !== "box")) {
      const box = boxOf(changeBoxType(createBoxTestData([{}]), "box_1", type));
      const { rows, cols, elevation } = FURNITURE_DEFAULTS[type];
      expect(box, type).toMatchObject({ type, rows, cols, elevation, w: 60, d: 50, h: 90 });
    }
  });

  it("벽걸이는 바닥에서 150cm 띄우고, 다른 종류로 바꾸면 다시 바닥에 둔다", () => {
    const wall = changeBoxType(createBoxTestData([{}]), "box_1", "wall");
    expect(boxOf(wall)?.elevation).toBe(150);
    expect(boxOf(changeBoxType(wall, "box_1", "desk"))?.elevation).toBe(0);
  });

  it("자동 이름이면 새 종류의 자동 이름이 된다 (비어 있는 가장 작은 번호)", () => {
    const original = createBoxTestData([
      { name: "보관함 3" },
      { name: "서랍장 1", type: "drawer" },
      { name: "서랍장 3", type: "drawer" },
    ]);
    expect(boxOf(changeBoxType(original, "box_1", "drawer"))?.name).toBe("서랍장 2");
    expect(boxOf(changeBoxType(original, "box_2", "cabinet"), 1)?.name).toBe("양문 수납장 1");
  });

  it("엣지: 사용자가 지은 이름·비슷한 이름은 그대로 둔다", () => {
    for (const name of ["화장대", "내 보관함 1", "보관함 1a", "보관함 01", "보관함", "서랍장 2"]) {
      const box = boxOf(changeBoxType(createBoxTestData([{ name }]), "box_1", "shelf"));
      expect(box?.name, name).toBe(name);
    }
  });

  it("물건은 남기고, 새 칸 수보다 뒤 칸의 물건만 칸 없음으로 옮긴다", () => {
    const items: Item[] = [
      { id: "item_1", name: "양말", slot: 0 },
      { id: "item_2", name: "여권", slot: 2, memo: "파란 파우치" },
      { id: "item_3", name: "충전기", slot: 7 },
      { id: "item_4", name: "선글라스" },
      { id: "item_5", name: "보조배터리", slot: 3 }, // 새 칸 수와 같은 번호 = 바로 뒤 칸
    ];
    const original = createBoxTestData([{ type: "cabinet", rows: 4, cols: 2, items }]);
    const result = boxOf(changeBoxType(original, "box_1", "drawer"))?.items; // 칸 3개 (0 ~ 2)
    expect(result).toEqual([
      { id: "item_1", name: "양말", slot: 0 },
      { id: "item_2", name: "여권", slot: 2, memo: "파란 파우치" },
      { id: "item_3", name: "충전기" },
      { id: "item_4", name: "선글라스" },
      { id: "item_5", name: "보조배터리" },
    ]);
  });

  it("엣지: 양문 수납장은 세로 × 가로 칸(4 × 2 = 8칸)까지 물건을 칸에 남긴다", () => {
    const items: Item[] = [
      { id: "item_1", name: "목도리", slot: 7 },
      { id: "item_2", name: "모자", slot: 8 },
    ];
    const original = createBoxTestData([{ type: "shelf", rows: 9, items }]);
    expect(boxOf(changeBoxType(original, "box_1", "cabinet"))?.items).toEqual([
      { id: "item_1", name: "목도리", slot: 7 },
      { id: "item_2", name: "모자" },
    ]);
  });

  it("엣지: 정해 둔 칸 높이는 칸 수가 바뀌니 지운다 (균등 분배)", () => {
    const original = createBoxTestData([{ type: "shelf", rows: 3, rowHeights: [40, 25, 25] }]);
    expect(boxOf(changeBoxType(original, "box_1", "drawer"))).not.toHaveProperty("rowHeights");
  });

  it("엣지: 같은 종류로 바꾸거나 없는 가구면 원본 그대로다 (되돌리기 기록이 안 남는다)", () => {
    const original = createBoxTestData([{}]);
    expect(changeBoxType(original, "box_1", "box")).toBe(original);
    expect(changeBoxType(original, "box_9", "drawer")).toBe(original);
  });

  it("엣지: 그 가구만 바꾼다", () => {
    const data = changeBoxType(createBoxTestData([{}, { x: 100 }]), "box_2", "bed");
    expect(boxOf(data, 0)?.type).toBe("box");
    expect(boxOf(data, 1)?.type).toBe("bed");
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const items: Item[] = [{ id: "item_1", name: "충전기", slot: 7 }];
    const original = deepFreeze(createBoxTestData([{ type: "cabinet", rows: 4, cols: 2, items }]));
    expect(boxOf(changeBoxType(original, "box_1", "box"))?.items).toEqual([
      { id: "item_1", name: "충전기" },
    ]);
  });

  it("가구 위 가구는 종류를 바꿔도 받침 가구 위 높이를 지킨다", () => {
    const data = createBoxTestData([{}, { elevation: 90, parentId: "box_1" }]);
    expect(boxOf(changeBoxType(data, "box_2", "drawer"), 1)).toMatchObject({
      elevation: 90,
      parentId: "box_1",
    });
  });

  it("엣지: 가구 위 가구를 벽걸이로 바꾸면 받침 가구에서 내려 벽걸이 기본 설치 높이로 띄운다", () => {
    const data = createBoxTestData([{}, { elevation: 90, parentId: "box_1" }]);
    const shelf = boxOf(changeBoxType(data, "box_2", "wall"), 1);
    expect(shelf?.elevation).toBe(FURNITURE_DEFAULTS.wall.elevation);
    expect(shelf?.parentId).toBeUndefined();
  });
});
