# 프로젝트 구조

## 기본 디렉터리 역할

- `src/app`: 전역 레이아웃, 라우팅 엔트리, 프로바이더
- `src/pages`: 화면 단위 조합
- `src/widgets`: 화면 구성 단위 컴포넌트
- `src/features`: 사용자 행동 중심 기능 단위
- `src/entities`: 도메인 모델 단위
- `src/shared`: 공통 유틸, UI, 훅, 타입

## 구조 설계 규칙

- 컴포넌트는 목적 기반으로 배치하고, 기능-도메인 규칙을 따른다.
- UI는 가능한 한 `shared/ui`로 표준화한다.
- 도메인 규칙은 UI와 분리해 테스트 가능성을 확보한다.

## 모듈 경계

- 상위 레이어만 하위 레이어를 참조한다.
- `shared`는 어디서나 사용 가능하되, 도메인 의존은 금지한다.

## 참고

- 위키: 프론트엔드 개발 표준 구조 설계
  - https://github.com/100-hours-a-week/7-team-temporary-wiki/wiki/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C-%ED%91%9C%EC%A4%80-%EA%B5%AC%EC%A1%B0-%EC%84%A4%EA%B3%84

