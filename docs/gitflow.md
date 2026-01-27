# Git 브랜치 전략 (GitFlow)

팀에서 합의한 GitFlow 운영 기준을 정리했다.
역할과 흐름만 간단히 적어두고, 운영/배포 책임은 분리한다.

---

## 1. 브랜치 역할 (확정)

- **main**: 운영 배포
  - 운영 서버 배포용 브랜치
  - 배포 시간대·운영 안정성 관리 → **플랫폼/배포 담당**
  - FE 개발자는 관여하지 않음

- **release (예: `release/1.0`)**: 스테이징 배포
  - 스테이징 서버 배포용 브랜치
  - QA / 검수 / 운영 전 최종 확인 용도
  - 스테이징 배포 시 **버전 업그레이드**
  - 배포는 요청 기반으로 진행

- **develop**: 개발 통합
  - feature 단위 작업이 모이는 브랜치
  - FE 개발자의 **주 작업 대상**

---

## 2. 개발·배포 흐름

### ① 개발 단계 (FE)

```
feature/*
  ↓ (셀프 리뷰 + CI)
develop
```

- feature 브랜치에서 개발
- 셀프 리뷰 후 **develop으로 PR**
- develop에는 **CI만 수행** (배포 없음)

### ② 스테이징 배포 요청

```
develop
  ↓ (PR / 요청)
release/x.y.z
```

- **큰 기능 단위(API 연동 완료 등)** 기준으로
- “이 시점 코드 검수 요청드립니다” → **노티**
- release 브랜치로 merge
- **CI/CD 통해 스테이징 서버 배포**
- QA / 검수 / 필요한 수정 진행

### ③ 운영 배포 (배포 담당)

```
release/x.y.z
  ↓
main
```

- release → main merge
- 운영 서버 배포
- 배포 시간대 및 장애 대응은 **배포 담당이 관리**
- 장애 발생 시 FE에게 공유/연락

---

## 3. CI / CD 범위

| 브랜치  | CI  | CD  | 설명             |
| ------- | --- | --- | ---------------- |
| feature | ❌  | ❌  | 로컬/셀프 리뷰   |
| develop | ✅  | ❌  | 개발 안정성 확인 |
| release | ✅  | ✅  | 스테이징 배포    |
| main    | ✅  | ✅  | 운영 배포        |

---

## 4. FE 책임 범위

- feature → develop
  - **셀프 리뷰 + CI 통과 후 직접 머지**
- develop → release
  - **작업 내용 정리한 PR 생성**
  - 배포 가능 시점에 **노티**
- release → main
  - **관여하지 않음**
  - 배포/시간/장애 대응은 담당 영역

---

## 5. 최종 합의 요약

- FE는 **feature 단위 개발 후 develop에 머지**한다.
- **큰 기능 단위로 정리된 시점에 release 배포 요청(PR + 노티)**만 한다.
- release → main 운영 배포 및 시간 관리는 **배포 담당 영역**이다.
- 초반에는 요청 기반으로 운영하고, 번거로우면 추후 프로세스를 조정한다.

---

## 6. 브랜치 생성 방법 (실무 기준)

### 기능 개발 브랜치

1. `develop` 최신화

```
git checkout develop
git pull origin develop
```

2. feature 브랜치 생성

```
git checkout -b feature/<기능명>
```

예) `feature/login-form`

3. 작업 후 develop으로 PR

```
git push -u origin feature/<기능명>
```

PR 대상: `develop`

---

### 스테이징 배포 브랜치

1. `develop` 기준으로 release 브랜치 생성

```
git checkout develop
git pull origin develop
git checkout -b release/x.y.z
```

2. release 브랜치 push 및 PR/merge

```
git push -u origin release/x.y.z
```

PR/merge 대상: `release/x.y.z` (운영 방식에 맞게 진행)
