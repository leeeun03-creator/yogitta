import { describe, expect, it } from "vitest";
import type { RoomLine } from "@/shared/types";
import { addRoomLine } from "./addRoomLine";
import { removeRoomLine } from "./removeRoomLine";
import { createWallTestData } from "./wallFixtures";

const LINE: RoomLine = {
  id: "roomLine_1",
  points: [
    { x: 300, y: 0 },
    { x: 310, y: 200 },
    { x: 300, y: 450 },
  ],
};

describe("addRoomLine", () => {
  it("현재 공간에만 구역 선을 더한다 (처음이면 목록을 만든다)", () => {
    const data = addRoomLine(createWallTestData(), LINE);
    expect(data.spaces[0]?.roomLines).toEqual([LINE]);
    expect(data.spaces[1]?.roomLines).toBeUndefined();
  });

  it("이미 있는 구역 선 뒤에 더한다", () => {
    const once = addRoomLine(createWallTestData(), LINE);
    const twice = addRoomLine(once, { ...LINE, id: "roomLine_2" });
    expect(twice.spaces[0]?.roomLines?.map((line) => line.id)).toEqual([
      "roomLine_1",
      "roomLine_2",
    ]);
  });

  it("엣지: 점이 2개보다 적은 선은 더하지 않는다", () => {
    const original = createWallTestData();
    expect(addRoomLine(original, { ...LINE, points: [{ x: 0, y: 0 }] })).toBe(original);
  });

  it("엣지: 현재 공간이 없으면 그대로 둔다", () => {
    const original = { ...createWallTestData(), currentSpaceId: null };
    expect(addRoomLine(original, LINE)).toBe(original);
  });

  it("엣지: 원본 데이터를 바꾸지 않는다", () => {
    const original = createWallTestData();
    addRoomLine(original, LINE);
    expect(original.spaces[0]?.roomLines).toBeUndefined();
  });
});

describe("removeRoomLine", () => {
  it("그 구역 선만 지운다", () => {
    const data = addRoomLine(addRoomLine(createWallTestData(), LINE), {
      ...LINE,
      id: "roomLine_2",
    });
    const next = removeRoomLine(data, "roomLine_1");
    expect(next.spaces[0]?.roomLines?.map((line) => line.id)).toEqual(["roomLine_2"]);
  });

  it("엣지: 없는 구역 선·구역 선이 없는 공간은 그대로 둔다", () => {
    const data = addRoomLine(createWallTestData(), LINE);
    expect(removeRoomLine(data, "roomLine_9")).toBe(data);
    const empty = createWallTestData();
    expect(removeRoomLine(empty, "roomLine_1")).toBe(empty);
  });
});
