---
name: yogitta-code
description: 요깃따 코드를 새로 쓰거나 고치기 전에 항상 먼저 읽는다. 코드 규칙의 목차라 여기서 맞는 작은 스킬(구조·모양·엣지 케이스·작업 흐름)로 간다.
---

# 요깃따 코드 작성 규칙 (목차)

목표: 프로젝트가 커져도 **어디에 뭐가 있는지 바로 알고**, 한 기능을 고쳐도 **다른 기능이 안 깨지는** 코드.
기술 스택: Vite + React + TypeScript, React Three Fiber + drei, zustand, Vitest.

함께 쓰는 스킬
- 색·컴포넌트 모양 → `yogitta-design`
- 커밋 메시지·타이밍 → `commit-convention`
- 테스트 항목·완료 기준 → `yogitta-test`

---

## 목차 — 하는 일에 맞는 작은 스킬을 부른다

이 스킬은 목차다. 아래에서 지금 하는 일에 맞는 작은 스킬을 **Skill 도구로 불러** 읽고 따른다.
다른 스킬에 있는 "`yogitta-code` N장" 같은 참조도 이 표에서 장 번호로 찾는다.

| 장 | 다루는 것 | 부를 스킬 |
|---|---|---|
| 1~3장 | 파일 위치·import·store | `yogitta-code-structure` |
| 4~8장 | 이름·크기·타입·상수·주석·용어 | `yogitta-code-style` |
| 9~10장 | 빈 상태·오류 처리, 검사 도구 | `yogitta-code-safety` |
| 11~13장 | 계획 → 작성 → 자가 점검 → 검사 → 커밋, 정리 점검 | `yogitta-code-workflow` |

## 늘 지킬 것 (작은 스킬을 부르기 전에도)

- 기능(feature) 단위 폴더. 다른 feature는 `index.ts`로만, 경로는 `@/`
- 계산은 `logic`·`shared/lib`의 순수 함수로, 데이터 변경은 store 액션으로만
- 파일 200줄·함수 40줄, `any`·`as`(`as const` 빼고) 금지, 한 파일에 대표 export 하나
- 주석·문서·커밋의 용어는 `.claude/skills/yogitta-code/glossary.md`만 쓴다
