/** 공간·벽·가구·물건에 붙일 고유 id를 만든다. 접두사로 무엇의 id인지 알아볼 수 있게 한다. */
export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
