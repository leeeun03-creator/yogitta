const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const HEX_RADIX = 16;
const CHANNEL_DIGITS = 2;

const channelsOf = (hex: string) => {
  if (!HEX_COLOR.test(hex)) throw new Error(`색 형식이 아니다: ${hex}`);
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), HEX_RADIX));
};

/**
 * "#RRGGBB" 색 from을 to 쪽으로 ratio만큼 섞는다 (0 = from 그대로, 1 = to). 3D에서 찾은 가구 말고 나머지를
 * 바탕색 쪽으로 흐리게 칠할 때 쓴다 (yogitta-design 5장).
 */
export function mixColor(from: string, to: string, ratio: number): string {
  const target = channelsOf(to);
  const mixed = channelsOf(from).map((channel, index) =>
    Math.round(channel + ((target[index] ?? channel) - channel) * ratio),
  );
  return `#${mixed.map((channel) => channel.toString(HEX_RADIX).padStart(CHANNEL_DIGITS, "0")).join("")}`.toUpperCase();
}
