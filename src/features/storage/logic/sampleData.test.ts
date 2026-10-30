import { describe, expect, it } from "vitest";
import { boxRooms } from "@/features/spaces";
import { overlappingBoxes } from "@/shared/lib/overlappingBoxes";
import { isAppData } from "./isAppData";
import { SAMPLE_DATA } from "./sampleData";

const spaceNamed = (name: string) => SAMPLE_DATA.spaces.find((space) => space.name === name);

describe("SAMPLE_DATA", () => {
  it("저장 데이터 검사를 통과하고 내 방부터 연다", () => {
    expect(isAppData(SAMPLE_DATA)).toBe(true);
    expect(SAMPLE_DATA.spaces.map((space) => space.name)).toEqual(["내 방", "형 방"]);
    expect(SAMPLE_DATA.currentSpaceId).toBe(spaceNamed("내 방")?.id);
  });

  it("엣지: 가구는 모두 바닥 안에 있고 벽·다른 가구와 겹치지 않는다", () => {
    for (const space of SAMPLE_DATA.spaces) {
      expect(overlappingBoxes(space).size).toBe(0);
      for (const box of space.boxes) {
        expect(box.x - box.w / 2).toBeGreaterThanOrEqual(0);
        expect(box.x + box.w / 2).toBeLessThanOrEqual(space.floor.w);
        expect(box.z - box.d / 2).toBeGreaterThanOrEqual(0);
        expect(box.z + box.d / 2).toBeLessThanOrEqual(space.floor.h);
      }
    }
  });

  it("엣지: 공간 안 가구 이름은 겹치지 않고, 물건 칸은 그 가구 칸 안이며, id는 모두 다르다", () => {
    const ids: string[] = [];
    for (const space of SAMPLE_DATA.spaces) {
      const names = space.boxes.map((box) => box.name);
      expect(new Set(names).size).toBe(names.length);
      for (const box of space.boxes) {
        ids.push(box.id, ...box.items.map((item) => item.id));
        for (const item of box.items) {
          if (item.slot !== undefined) expect(item.slot).toBeLessThan(box.rows * box.cols);
        }
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("내 방은 구역 선으로 침실·작업 공간이 나뉘고, 가구가 제 구역에 놓인다", () => {
    const room = spaceNamed("내 방");
    if (!room) throw new Error("내 방이 없다");
    const rooms = boxRooms(room);
    const roomOf = (name: string) =>
      rooms.get(room.boxes.find((box) => box.name === name)?.id ?? "");
    expect(roomOf("화장대 서랍장")).toBe("침실");
    expect(roomOf("책상")).toBe("작업 공간");
  });

  it("여권이 내 방과 형 방 두 곳에 있다 (다른 공간에도 있어요를 보이게)", () => {
    const passportSpaces = SAMPLE_DATA.spaces.filter((space) =>
      space.boxes.some((box) => box.items.some((item) => item.name === "여권")),
    );
    expect(passportSpaces.map((space) => space.name)).toEqual(["내 방", "형 방"]);
  });
});
