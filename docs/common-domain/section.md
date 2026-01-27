## 에러 처리 / 사용자 피드백 정책

### 역할

- 에러 메시지 표현 방식 통일
- 서버/네트워크/권한 에러 구분

### 포함 요소

- Error Boundary
- 공통 Toast 메시지
- 에러 코드 → UX 매핑

### 왜 공통인가

- 에러는 기능이 아니라 “상태”
- 전 도메인에 동일한 UX 요구

- **retry 정책 (401/403/500 분기)**
- **refetchOnWindowFocus / reconnect 정책**
- **실시간 데이터(Query vs WebSocket) 경계**
