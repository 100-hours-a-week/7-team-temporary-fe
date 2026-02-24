## PR 제목 규칙

- 형식: `[<이슈 area 라벨> #이슈번호] 타입: 요약`
- 예시:
  - `[cookie-forwarding #201] feat: Thin BFF 쿠키/헤더 전달 규칙 구현`
  - `[auth-proxy #202] fix: refreshAndRetry 401 처리 정리`
  - `[observability #203] docs: 관측/배포/롤백 가이드 정리`

## PR 메타

- Assignees: `happy7yong`
- Milestone: `V2`

## 라벨 동기화 명령 (선택)

```bash
# ISSUE=연결 이슈 번호, PR=현재 PR 번호
ISSUE=201
PR=225

while IFS= read -r label; do
  gh pr edit "$PR" --add-label "$label"
done < <(gh issue view "$ISSUE" --json labels -q '.labels[].name')
```

## 변경 사항 요약

- 

## 작업 배경/목적

- 

## 영향 범위

- 

## 테스트/검증

- 

## 관련 이슈

- Closes #

## 참고 문서/링크

- 
