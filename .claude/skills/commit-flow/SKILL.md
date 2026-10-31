---
name: commit-flow
description: 요깃따에서 언제 커밋할지, Todo를 바꿀 때의 todo: 커밋, Claude가 커밋할 때의 순서, README용 커밋 로그 뽑기를 다룰 때 읽는다. 보통 commit-convention 목차에서 부른다.
---

# 요깃따 커밋 시점과 순서

`commit-convention` 스킬의 2·6·7·8장이다 (장 번호는 그대로 둔다). 목차와 늘 지킬 것은 `commit-convention`에 있다.

## 2. 언제 커밋하나

| 상황 | 커밋 |
|---|---|
| 세부 Todo(Tn-n) 하나를 끝냈을 때 | 반드시 커밋 + push |
| 작업 중·테스트 중 버그나 오류를 고쳤을 때 | 고친 것 하나마다 따로 커밋 (5장 형식) |
| 세부 Todo를 추가·삭제·수정·순서 변경했을 때 | `todo:` 커밋 (6장) |
| 하루 작업 끝 | 최소 1회 push. 빌드가 되는 상태로 |

- 한 커밋 = 세부 Todo 하나. `T3-1`과 `T3-2`를 한 커밋에 섞지 않는다
- 빌드가 깨진 상태로는 커밋하지 않는다

## 6. Todo가 바뀔 때 (`docs/todo/log/` 로그용)

세부 Todo를 추가·삭제·수정하거나 우선순위를 바꾸면 **코드와 따로** `todo:` 커밋을 만든다. 본문에 이유와 변경 전후를 반드시 쓴다.

```
todo: T3-5 연속 직선 끝점 스냅 추가

- 이유: 테스트해보니 벽 끝이 안 맞아서 틈이 생김
- 추가: T3-5 연속 직선 끝점 스냅 (P1)
```

```
todo: T18-1 벽 모서리 이음새를 P2로 하향

- 이유: 기둥 박스로 가리니 눈에 띄지 않음
- 변경 전: P1 / 변경 후: P2
```

- 변경 종류는 `추가` · `삭제` · `수정` · `상향` · `하향` · `분할` · `병합` 중 하나
- 같은 커밋에서 로그도 함께 남긴다: `docs/todo/log/Tn.md`, 여러 큰 Todo에 걸치면 `log/전체.md` (`yogitta-todo` 6장)

## 7. 순서 (Claude가 커밋할 때)

1. 지금 끝낸 세부 Todo 번호 확인 (`docs/todo/Tn.md`에 없으면 먼저 `todo:` 커밋으로 추가)
2. `git status`로 바뀐 파일 확인
3. `npm run check`와 바뀐 기능의 실제 테스트(데스크톱) 통과 확인. 실제 테스트 전체는 push 뒤 CI가 돌린다 (실패하면 커밋하지 않고 먼저 고친다, `yogitta-test` 1장)
4. 관련 파일만 `git add <파일>`
5. `Tn-n: 작업 내용` 형식으로 `git commit`
6. `docs/todo/Tn.md`에서 해당 세부 Todo 체크 + 결과 한 줄, `docs/TODO.md` 진행 수 올리기 (`yogitta-todo` 5장) (`- [x] T3-3 사각형 도구`) — 같은 커밋에 포함
7. `git push`
8. 사용자에게 한 줄 보고: 커밋 첫 줄 + 다음 세부 Todo

커밋하지 않는 것: `node_modules/`, `dist/`(배포 브랜치 제외), `.env`, 개인 메모, 비밀번호·토큰

## 8. README용으로 로그 뽑기

```bash
git log --pretty=format:"%ad | %s" --date=short                    # 전체 흐름
git log --pretty=format:"%ad | %s" --date=short --grep="^todo:"    # Todo 변경만 (내용은 docs/todo/log/)
git log --pretty=format:"%s" --grep="^T3-"                         # T3의 세부 작업만
git log --pretty=format:"%ad | %s" --date=short --grep="버그수정\|오류수정"   # 고친 것 전체
git log --pretty=format:"%s" --grep="\[3D\]"                        # 3D 영역에서 고친 것만
```
