import type { Point } from "@/shared/types";
import type { Footprint } from "./boxFootprint";
import { distance } from "./distance";
import { isBoxBlocked } from "./isBoxBlocked";

/** 맞닿는 자리를 찾는 반복 횟수. 3000cm를 2^20으로 나누면 0.003cm까지 좁혀진다. */
const SEARCH_STEPS = 20;
/**
 * 맞닿은 자리를 0.01cm 단위로 출발 쪽으로 자른다. 찾은 자리는 맞닿음 허용(0.01cm)만큼 파고든 끝이라,
 * 잘라 내면 면에 정확히 붙고 데이터에 긴 소수도 남지 않는다.
 */
const CONTACT_STEPS_PER_CM = 100;

type Axis = "x" | "y";
type MoveInput = {
  from: Point; // 지금 가구 가운데 (cm). 막히지 않은 자리여야 한다
  to: Point; // 옮기려는 가운데 (cm)
  size: Footprint;
  obstacles: readonly (readonly Point[])[]; // 벽·다른 가구 모양 (boxObstacles)
};

/** from에서 한 축으로만 to까지 가는 동안 쓸고 지나간 사각형이 막히는지. 끝 자리만 보면 한 번에 벽을 건너뛸 수 있어서다. */
function sweepBlocked({ from, size, obstacles }: MoveInput, axis: Axis, target: number) {
  const start = from[axis];
  const middle = { ...from, [axis]: (start + target) / 2 };
  const length = Math.abs(target - start);
  const swept =
    axis === "x" ? { w: size.w + length, d: size.d } : { w: size.w, d: size.d + length };
  return isBoxBlocked(middle, swept, obstacles);
}

/** 한 축으로 to 쪽으로 갈 수 있는 데까지 간 자리. 막히면 맞닿는 자리(면에 딱 붙음)다. */
function slideAxis(input: MoveInput, axis: Axis): Point {
  const start = input.from[axis];
  const goal = input.to[axis];
  if (!sweepBlocked(input, axis, goal)) return { ...input.from, [axis]: goal };
  let low = 0; // 갈 수 있는 비율
  let high = 1; // 막히는 비율
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (low + high) / 2;
    if (sweepBlocked(input, axis, start + (goal - start) * middle)) high = middle;
    else low = middle;
  }
  const travel = Math.trunc((goal - start) * low * CONTACT_STEPS_PER_CM) / CONTACT_STEPS_PER_CM;
  return { ...input.from, [axis]: start + travel };
}

/** 두 축을 차례로 옮긴 자리 (앞 축이 막히면 맞닿고, 뒤 축은 그 자리에서 이어 간다). */
function slideBoth(input: MoveInput, first: Axis, second: Axis): Point {
  const halfway = slideAxis(input, first);
  return slideAxis({ ...input, from: halfway }, second);
}

/**
 * 가구를 from에서 to로 옮길 때 실제로 갈 자리. 벽·다른 가구를 뚫지 않고, 막히면 그 면에 딱 붙어 멈추며
 * 막히지 않은 축으로는 미끄러지듯 따라간다(가로 먼저·세로 먼저 중 to에 더 가까운 쪽).
 * 이미 겹쳐 있는 가구(나중에 그은 벽 등)는 빼낼 수 있게 막지 않는다.
 */
export function resolveBoxMove(input: MoveInput): Point {
  if (isBoxBlocked(input.from, input.size, input.obstacles)) return input.to;
  const xFirst = slideBoth(input, "x", "y");
  const yFirst = slideBoth(input, "y", "x");
  return distance(yFirst, input.to) < distance(xFirst, input.to) ? yFirst : xFirst;
}
