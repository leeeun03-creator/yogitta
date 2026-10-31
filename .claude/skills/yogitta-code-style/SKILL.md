---
name: yogitta-code-style
description: 요깃따 코드에서 이름을 짓거나, 파일·함수가 길어지거나, 타입·상수·주석·용어를 쓸 때 읽는다. 보통 yogitta-code 목차에서 부른다.
---

# 요깃따 코드 모양

`yogitta-code` 스킬의 4~8장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-code`에 있다.

## 4. 이름 규칙

| 대상 | 형식 | 예 |
|---|---|---|
| 컴포넌트 파일·이름 | PascalCase | `ResultCard.tsx`, `FurniturePanel` |
| 훅 | `use` + PascalCase | `useSearch`, `useSelectedBox` |
| 함수 | camelCase, 동사로 시작 | `buildLocationSentence`, `segmentToWall` |
| 불리언 | `is` / `has` / `can` | `isOpen`, `hasItems` |
| 상수 | UPPER_SNAKE_CASE | `WALL_HEIGHT_CM` |
| 타입 | PascalCase, 접두사 없음 | `Box`, `FurnitureType` (`IBox` 금지) |
| 이벤트 핸들러 | `handle` + 이벤트 / props는 `on` + 이벤트 | `handleClick`, `onSelect` |
| 테스트 | 원본 이름 + `.test.ts` | `josa.test.ts` |

- 파일 이름 = 그 파일이 export하는 대표 이름
- 축약 금지 (`btn`, `itm`, `calc` ✗ → `button`, `item`, `calculate`)

## 5. 크기 규칙

| 대상 | 기준 | 넘으면 |
|---|---|---|
| 파일 | 200줄 | 하위 컴포넌트 / logic으로 분리 |
| 함수 | 40줄 | 단계별 작은 함수로 분리 |
| 컴포넌트 props | 7개 | 객체로 묶거나 컴포넌트를 나눔 |
| JSX 중첩 | 4단계 | 안쪽을 컴포넌트로 |
| 한 파일 export | 대표 1개 (+ 타입) | 파일 분리 |

## 6. 타입 규칙

- `tsconfig`는 `strict: true`, `noUncheckedIndexedAccess: true`
- `any` 금지. 정말 모르면 `unknown` 후 좁히기
- 앱 데이터 타입은 `shared/types`에만 정의 (기획서·PRD 부록 B와 같게)
- 단위가 있는 숫자는 이름이나 주석에 단위: `widthCm` 또는 `w: number; // cm`
- 가구 종류처럼 정해진 값은 문자열 유니온 + 상수 배열

```ts
export const FURNITURE_TYPES = ["cabinet", "drawer", "shelf", "wall", "desk", "table", "bed", "box"] as const;
export type FurnitureType = (typeof FURNITURE_TYPES)[number];
```

- `as` 강제 변환 금지 (외부 JSON 불러올 때만, 검증 함수 뒤에서)

## 7. 상수 · 매직넘버

코드 중간에 의미 있는 숫자를 직접 쓰지 않는다. `shared/constants/`에 이름을 붙여 둔다.

```ts
// shared/constants/scene.ts
export const WALL_HEIGHT_CM = 110;        // 컷어웨이 벽 높이
export const WALL_THICKNESS_CM = 12;
export const GRID_SNAP_CM = 10;
export const CIRCLE_SEGMENTS = 32;
export const FACE_SHADE = { top: 1, front: 0.86, side: 0.74 } as const;
export const DRAWER_OPEN_CM = 26;
export const UNDO_LIMIT = 50;
export const STORAGE_KEY = "yogitta:v1";
```

- 색은 CSS에서는 `var(--yg-…)`, 3D에서는 `shared/constants/colors3d.ts` 한 곳에서만
- 0, 1, -1, 2(절반) 같은 자명한 숫자는 예외

## 8. 주석 · 문서

### 용어 통일 (가장 중요)

주석, README, 커밋 메시지, 기획서 모두 **같은 개념은 같은 단어**로 쓴다. 기준은 `.claude/skills/yogitta-code/glossary.md`.

- 쓰기 전에 `glossary.md`를 읽는다
- "쓰지 않는 말"에 있는 단어를 쓰지 않는다 (예: "방" ✗ → "공간" 또는 "구역", "슬롯"·"단" ✗ → "칸", "아이템" ✗ → "물건")
- 용어집에 없는 새 개념은 **먼저 `glossary.md`에 추가**하고 쓴다 (`docs: 용어집에 ○○ 추가` 커밋)
- 코드 이름과 한국어 용어가 1:1로 맞게 짓는다 (`Space` = 공간, `slot` = 칸)
- 주석·README는 "~한다"체, 화면 문구만 "~해요"체

### 주석 쓰는 법

- 주석은 **한국어**, "무엇을"보다 **"왜"**
- export하는 함수·컴포넌트 위에 한 줄 설명

```ts
/** 2D 선분(cm)을 3D 벽 박스의 위치·길이·회전으로 바꾼다. 2D y = 3D z. */
export function segmentToWall(a: Point, b: Point): WallTransform { … }
```

- 주석 처리한 옛 코드는 남기지 않는다 (git에 있음)
- `TODO` 주석은 세부 Todo 번호와 함께: `// TODO(T18-1): 모서리 기둥`
