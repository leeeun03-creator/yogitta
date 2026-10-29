const FIRST_NAME = "내 방";
const NEW_NAME = "새 공간";
const FIRST_NUMBER = 2; // "새 공간" 다음은 "새 공간 2"

/**
 * 바닥 크기 카드에 처음 넣어 둘 공간 이름. 첫 공간은 "내 방", 이미 있으면 "새 공간", "새 공간 2" … 중 안 쓴 이름
 * (같은 이름이면 만들 수 없어서, 카드를 열자마자 안내 문구가 뜨지 않게).
 */
export function defaultSpaceName(existingNames: readonly string[]): string {
  const taken = new Set(existingNames.map((name) => name.trim()));
  if (!taken.has(FIRST_NAME)) return FIRST_NAME;
  if (!taken.has(NEW_NAME)) return NEW_NAME;
  let number = FIRST_NUMBER;
  while (taken.has(`${NEW_NAME} ${number}`)) number++;
  return `${NEW_NAME} ${number}`;
}
