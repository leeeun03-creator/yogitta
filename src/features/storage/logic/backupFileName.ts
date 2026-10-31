/** 백업 파일 이름 (T17): "yogitta-backup-2026-11-01.json". 날짜는 사용자 컴퓨터의 날짜다. */
export function backupFileName(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `yogitta-backup-${day}.json`;
}
