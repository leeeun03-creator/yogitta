import { describe, expect, it } from "vitest";
import type { Box, Point, RoomLine, Space, Wall } from "@/shared/types";
import { boxRooms } from "./boxRooms";
import { roomAreas } from "./roomAreas";

const FLOOR = { w: 600, h: 450 };
const at = (x: number, y: number): Point => ({ x, y });
const MIDDLE: RoomLine = { id: "line_1", points: [at(300, 0), at(300, 450)] }; // 왼쪽·오른쪽 구획
const ANCHORS = { 거실: at(100, 100), 안방: at(500, 100) };

const box = (id: string, x: number, z: number): Box => ({
  id,
  name: id,
  type: "box",
  x,
  z,
  rotation: 0,
  w: 60,
  d: 50,
  h: 90,
  elevation: 0,
  rows: 1,
  cols: 1,
  items: [],
});

const space = (overrides: Partial<Space>): Space => ({
  id: "space_1",
  name: "내 방",
  floor: FLOOR,
  rooms: ["거실", "안방"],
  roomAnchors: ANCHORS,
  roomLines: [MIDDLE],
  walls: [],
  boxes: [],
  ...overrides,
});

describe("boxRooms", () => {
  it("가구 가운데가 든 구획의 구역이다", () => {
    const rooms = boxRooms(space({ boxes: [box("a", 150, 200), box("b", 450, 300)] }));
    expect([...rooms]).toEqual([
      ["a", "거실"],
      ["b", "안방"],
    ]);
  });

  it("엣지: 구역이 없는 구획의 가구는 빠진다 (구역 없음)", () => {
    const rooms = boxRooms(space({ rooms: ["거실"], boxes: [box("b", 450, 300)] }));
    expect(rooms.has("b")).toBe(false);
  });

  it("엣지: 구역 선 대신 벽으로 나눠도 같다", () => {
    const wall: Wall = { id: "wall_1", tool: "line", points: MIDDLE.points, closed: false };
    const rooms = boxRooms(space({ roomLines: [], walls: [wall], boxes: [box("b", 450, 300)] }));
    expect(rooms.get("b")).toBe("안방");
  });

  it("엣지: 가운데가 구역 선 위면 2D 평면도에서 그 자리를 칠한 구역이다", () => {
    const target = space({ boxes: [box("a", 300, 200)] });
    const room = boxRooms(target).get("a");
    const area = roomAreas(FLOOR, [MIDDLE], target.rooms, ANCHORS).find((a) => a.room === room);
    const isPainted = area?.rects.some(
      (rect) => rect.x <= 300 && 300 < rect.x + rect.w && rect.y <= 200 && 200 < rect.y + rect.h,
    );
    expect(room).toBeDefined();
    expect(isPainted).toBe(true);
  });

  it("엣지: 구역 기준점이 없는 구역은 어느 가구의 구역도 아니다", () => {
    const rooms = boxRooms(
      space({ roomAnchors: { 거실: at(100, 100) }, boxes: [box("b", 450, 300)] }),
    );
    expect(rooms.has("b")).toBe(false);
  });

  it("엣지: 구역 선을 지워 한 구획에 구역이 둘이면 목록 앞의 구역이다", () => {
    const rooms = boxRooms(space({ roomLines: [], boxes: [box("b", 450, 300)] }));
    expect(rooms.get("b")).toBe("거실");
  });

  it("엣지: 가구 50개도 하나씩 제 구역을 찾는다", () => {
    const boxes = Array.from({ length: 50 }, (_, i) =>
      box(`box_${i}`, i % 2 ? 450 : 150, 20 + i * 8),
    );
    const rooms = boxRooms(space({ boxes }));
    expect([...rooms.values()].filter((room) => room === "거실")).toHaveLength(25);
    expect([...rooms.values()].filter((room) => room === "안방")).toHaveLength(25);
  });

  it("엣지: 구역이 하나도 없으면 빈 결과다", () => {
    expect(boxRooms(space({ rooms: [], boxes: [box("a", 150, 200)] })).size).toBe(0);
  });
});
