const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const CHANNEL_MAX = 255;
const HEX_RADIX = 16;
const CHANNEL_DIGITS = 2;

/** "#RRGGBB" 색의 밝기를 factor배로 바꾼다 (0 = 검정, 1 = 그대로). 3D 면 음영에 쓴다. */
export function shadeColor(hex: string, factor: number): string {
  if (!HEX_COLOR.test(hex)) throw new Error(`색 형식이 아니다: ${hex}`);
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), HEX_RADIX));
  const shaded = channels.map((channel) =>
    Math.min(CHANNEL_MAX, Math.max(0, Math.round(channel * factor))),
  );
  return `#${shaded.map((channel) => channel.toString(HEX_RADIX).padStart(CHANNEL_DIGITS, "0")).join("")}`.toUpperCase();
}
