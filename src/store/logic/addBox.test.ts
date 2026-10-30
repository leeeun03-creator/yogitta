import { describe, expect, it } from "vitest";
import { addBox } from "./addBox";
import { createBoxTestData } from "./boxFixtures";
import { deepFreeze } from "./spaceFixtures";

const INPUT = { id: "box_new", center: { x: 120, y: 80 }, w: 60, d: 50 };

describe("addBox", () => {
  it("현재 공간에 보관함을 더한다 (칸 1개, 설치 높이 0, 물건 없음, 높이 90cm, 2D y = 3D z)", () => {
    const data = addBox(createBoxTestData(), INPUT);
    expect(data.spaces[0]?.boxes).toEqual([
      {
        id: "box_new",
        name: "보관함 1",
        type: "box",
        x: 120,
        z: 80,
        rotation: 0,
        w: 60,
        d: 50,
        h: 90,
        elevation: 0,
        rows: 1,
        cols: 1,
        items: [],
      },
    ]);
    expect(data.spaces[1]?.boxes).toEqual([]);
  });

  it("이름은 공간 안에서 비어 있는 가장 작은 번호다", () => {
    const data = createBoxTestData([{ name: "보관함 1" }, { name: "보관함 3" }]);
    expect(addBox(data, INPUT).spaces[0]?.boxes.at(-1)?.name).toBe("보관함 2");
  });

  it("엣지: 바닥 밖에 놓으면 가구 전체가 바닥 안에 들어오게 당긴다", () => {
    const box = addBox(createBoxTestData(), { ...INPUT, center: { x: -50, y: 9999 } }).spaces[0]
      ?.boxes[0];
    expect(box).toMatchObject({ x: 30, z: 425 });
  });

  it("엣지: 바닥보다 크면 바닥 크기로, 최소(10cm)보다 작거나 0·음수면 최소 크기로 만든다", () => {
    const big = addBox(createBoxTestData(), { ...INPUT, w: 900, d: 700 }).spaces[0]?.boxes[0];
    expect(big).toMatchObject({ w: 600, d: 450, x: 300, z: 225 });
    const tiny = addBox(createBoxTestData(), { ...INPUT, w: 3, d: -20 }).spaces[0]?.boxes[0];
    expect(tiny).toMatchObject({ w: 10, d: 10 });
    const zero = addBox(createBoxTestData(), { ...INPUT, w: 0, d: 0 }).spaces[0]?.boxes[0];
    expect(zero).toMatchObject({ w: 10, d: 10 });
  });

  it("엣지: 다른 가구에 파고드는 자리면 놓지 않고, 맞닿는 자리는 놓는다", () => {
    const data = createBoxTestData([{ x: 300, z: 200 }]); // 60 × 50: x 270 ~ 330
    expect(addBox(data, { ...INPUT, center: { x: 320, y: 200 } })).toBe(data);
    expect(addBox(data, { ...INPUT, center: { x: 360, y: 200 } }).spaces[0]?.boxes).toHaveLength(2);
  });

  it("엣지: 벽에 파고드는 자리면 놓지 않는다", () => {
    const base = createBoxTestData();
    const wall = {
      id: "wall_1",
      tool: "line" as const,
      points: [
        { x: 300, y: 0 },
        { x: 300, y: 450 },
      ],
      closed: false,
    };
    const [mine, other] = base.spaces;
    if (!mine || !other) throw new Error("테스트 공간이 없다");
    const data = { ...base, spaces: [{ ...mine, walls: [wall] }, other] };
    expect(addBox(data, { ...INPUT, center: { x: 300, y: 200 } })).toBe(data);
  });

  it("엣지: 현재 공간이 없으면 그대로 둔다", () => {
    const original = { ...createBoxTestData(), currentSpaceId: null };
    expect(addBox(original, INPUT)).toBe(original);
  });

  it("원본 데이터를 바꾸지 않는다", () => {
    const original = deepFreeze(createBoxTestData([{}]));
    expect(addBox(original, INPUT).spaces[0]?.boxes).toHaveLength(2);
  });
});
