---
name: yogitta-todo-log
description: 요깃따 Todo를 바꾸거나 버그·오류를 고쳐 docs/todo/log/에 남길 때, 오늘 할 일을 정하거나 하루를 마칠 때 읽는다. 보통 yogitta-todo 목차에서 부른다.
---

# 요깃따 Todo 변경 로그와 하루 마무리

`yogitta-todo` 스킬의 6~7장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `yogitta-todo`에 있다.

## 6. 바뀔 때 — 로그 쓰기

Todo를 바꾸거나 버그·오류를 고치면 **같은 커밋에** `docs/todo/log/`에 한 줄 남긴다. 로그는 Todo 파일과 따로 두고 필요할 때만 본다.

| 무엇이 바뀌었나 | 로그 파일 |
|---|---|
| 세부 Todo 추가·삭제·수정, 버그수정·오류수정, 큰 Todo 하나의 변경 | `docs/todo/log/Tn.md` (문제가 **생긴** 큰 Todo) |
| 큰 Todo 여러 개에 걸친 변경, Todo 구조 변경 | `docs/todo/log/전체.md` |

- 커밋: Todo 변경은 `todo:`, 버그·오류는 `Tn-n 버그수정[영역]` / `Tn-n 오류수정[영역]` (`commit-convention` 5·6장)
- **로그를 쓸 때는 `.claude/skills/yogitta-todo/references/log.md`를 연다** (로그 파일 틀, 칸 설명, 변경 종류, 예시)

## 7. 목표 · 오늘 할 일 · 하루 마무리

- **목표**는 할 일이 아니다 ("P0 완료 = 제출 가능"). `docs/TODO.md`의 "목표" 표에 따로 둔다
- **오늘 할 일(MIT)**: 그날 꼭 끝낼 세부 Todo 1~3개만 적는다
- **하루 양**: 할 수 있다고 생각하는 양의 70% 정도만 오늘 할 일에 넣는다
- **하루 마무리**: 남은 오늘 할 일을 다음 날로 옮기거나 지우고, 제출이 가까운데 밀렸으면 P2 → P1 순으로 빼서 로그(`log/전체.md`)에 남긴다 (`todo:` 커밋)
