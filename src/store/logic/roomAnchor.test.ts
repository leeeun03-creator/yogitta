import { describe, expect, it } from "vitest";
import type { AppData } from "@/shared/types";
import { addRoom } from "./addRoom";
import { removeRoom } from "./removeRoom";
import { renameRoom } from "./renameRoom";
import { createRoomTestData } from "./roomFixtures";

const anchorsOf = (data: AppData) => data.spaces[0]?.roomAnchors;

/** 결과가 ok면 데이터를, 아니면 테스트를 실패시킨다. */
function okData(result: ReturnType<typeof addRoom>): AppData {
  if (!result.ok) throw new Error(`막힘: ${result.reason}`);
  return result.data;
}

describe("구역 기준점", () => {
  it("자리와 함께 더하면 그 자리가 구역 기준점이 된다", () => {
    const data = okData(addRoom(createRoomTestData(), " 안방 ", { x: 120, y: 80 }));
    expect(anchorsOf(data)).toEqual({ 안방: { x: 120, y: 80 } });
  });

  it("자리 없이 더하면 구역 기준점은 생기지 않는다", () => {
    expect(anchorsOf(okData(addRoom(createRoomTestData(), "안방")))).toBeUndefined();
  });

  it("이름을 바꾸면 구역 기준점도 새 이름으로 옮긴다", () => {
    const data = okData(addRoom(createRoomTestData(), "안방", { x: 120, y: 80 }));
    const renamed = okData(renameRoom(data, "안방", "침실"));
    expect(anchorsOf(renamed)).toEqual({ 침실: { x: 120, y: 80 } });
  });

  it("지우면 구역 기준점도 지운다", () => {
    const one = okData(addRoom(createRoomTestData(), "안방", { x: 120, y: 80 }));
    const two = okData(addRoom(one, "거실", { x: 450, y: 80 }));
    expect(anchorsOf(removeRoom(two, "안방"))).toEqual({ 거실: { x: 450, y: 80 } });
  });

  it("엣지: 막힌 이름이면 구역 기준점도 생기지 않는다", () => {
    const data = okData(addRoom(createRoomTestData(), "안방", { x: 120, y: 80 }));
    expect(addRoom(data, "안 방", { x: 450, y: 80 }).ok).toBe(false);
  });

  it("엣지: 원본 자리 객체를 그대로 담지 않는다 (복사)", () => {
    const at = { x: 120, y: 80 };
    const data = okData(addRoom(createRoomTestData(), "안방", at));
    expect(anchorsOf(data)?.안방).not.toBe(at);
  });
});
