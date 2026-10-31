---
name: yogitta-code-workflow
description: 요깃따 세부 Todo를 시작해 계획·자가 점검·검사·커밋을 할 때, 큰 Todo 끝에 정리 점검을 할 때 읽는다. 보통 yogitta-code 목차에서 부른다.
---

# 요깃따 작업 흐름

`yogitta-code` 스킬의 11~13장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-code`에 있다.

## 11. 작업 흐름 (매번 이 순서)

```
① 계획(+테스트 항목) → ② 작성 → ③ 자가 점검 → ④ npm run check + 바뀐 기능의 실제 테스트(데스크톱) → ⑤ 커밋 (실제 테스트 전체는 push 뒤 CI)
```

### ① 계획 — 코드 쓰기 전에 사용자에게 짧게 보여준다

```
T10-2 계획
- 새 파일: features/search/logic/josa.ts, josa.test.ts
- 수정: features/search/logic/buildLocationSentence.ts (josa 사용)
- 영향: ResultCard 문구만 바뀜, 다른 feature 영향 없음
- 테스트: 코드 — 받침 있음·없음·영어·숫자 / 실제 — 결과 카드에 "여권은" 표시 (yogitta-test 3장)
```

### ② 작성

1~10장 규칙대로. 한 번에 세부 Todo 하나만.

### ③ 자가 점검 체크리스트

- [ ] 파일이 맞는 feature 폴더에 있다
- [ ] 다른 feature는 `index.ts`로만 import했다, `@/` 경로를 썼다
- [ ] 계산 로직은 logic/lib의 순수 함수로 뺐다
- [ ] 데이터 변경은 store 액션으로만 했다
- [ ] 파일 200줄, 함수 40줄 이하다
- [ ] `any`, 매직넘버, 주석 처리된 옛 코드가 없다
- [ ] 빈 상태·오류 상태를 처리했다
- [ ] 새 순수 함수에 코드 테스트를(엣지 케이스는 여기서), 새 화면 기능에 실제 테스트 1~2개를 붙였다 (`yogitta-test` 3장)
- [ ] 화면 요소는 `yogitta-design` 규칙대로다
- [ ] 주석·문구의 용어가 `glossary.md`와 같다 ("쓰지 않는 말"이 없다)

### ④ 자동 검사

`npm run check`와 바뀐 기능의 실제 테스트(데스크톱) 통과. 실제 테스트 전체는 로컬에서 돌리지 않고 push 뒤 CI에 맡긴다. 실패하면 고치고 다시. 통과 전에는 커밋하지 않고, 다음 세부 Todo로 넘어가지 않는다 (`yogitta-test` 1·2장).

### ⑤ 커밋

`commit-convention` 스킬대로 (`Tn-n: 작업 내용`, 고친 건 `Tn-n 버그수정[영역]: …`).

### 보고

작업이 끝나면 사용자에게 3줄 이내로: 한 일 / 테스트 결과(`yogitta-test` 8장) / 다음 세부 Todo.

## 12. 정리 점검 (큰 Todo 하나 끝날 때마다)

큰 Todo(Tn)의 마지막 세부 Todo를 커밋한 뒤, 다음 Todo로 가기 전에 한 번 훑는다.

1. 200줄 넘은 파일, 40줄 넘은 함수 → 분리
2. 비슷한 코드가 두 군데 이상 → `shared`나 feature logic으로 합치기
3. 안 쓰는 파일·export·의존성 → 삭제
4. `index.ts` 공개 창구가 실제로 쓰는 것만 내보내는지
5. 상수가 흩어져 있지 않은지

고친 게 있으면 `chore: T3 정리 — 벽 도구 파일 분리` 처럼 따로 커밋한다. 동작이 바뀌면 안 된다 (`npm run check` 통과 + 화면 확인).

## 13. 하지 말 것

- 한 커밋·한 작업에 여러 세부 Todo 섞기
- feature 내부 파일 직접 import, 순환 import
- 컴포넌트에서 localStorage·JSON.parse 직접 호출
- store 데이터 직접 수정(대입·push)
- `any`, `// @ts-ignore`, `eslint-disable` (꼭 필요하면 이유 주석 + 사용자에게 알림)
- 사용자에게 묻지 않고 새 라이브러리 설치
- 규칙을 어겨야 할 것 같으면 혼자 판단하지 말고 이유를 말하고 물어본다
