# Jenkins Migration Guide (Docker Image CI/CD)

이 문서는 `/Users/dokkang/Projects/KakaoTech/molip/fe/7-team-temporary-fe/.github/workflows/fe-bigbang-ci.yaml`과 `/Users/dokkang/Projects/KakaoTech/molip/fe/7-team-temporary-fe/.github/workflows/fe-bigbang-cd.yaml`를 Jenkins로 옮기면서, 배포 방식을 `build once, deploy many`로 전환한 가이드입니다.

## 1) 파이프라인 파일

- CI: `/Users/dokkang/Projects/KakaoTech/molip/fe/7-team-temporary-fe/Jenkinsfile.ci`
- CD: `/Users/dokkang/Projects/KakaoTech/molip/fe/7-team-temporary-fe/Jenkinsfile.cd`

동작 요약:

- `CI`: Docker 이미지 빌드 -> 컨테이너 스모크 테스트 -> ECR 푸시(main/release)
- `CD(release/*)`: 스테이징 서버 단일 컨테이너 중단 배포
- `CD(main)`: 운영 AWS 단일 인스턴스 내부 Blue/Green 배포 (Nginx upstream 전환)

## 2) Jenkins 플러그인

아래 플러그인을 설치하세요.

- Pipeline
- Git
- GitHub Branch Source
- Credentials Binding
- (선택) ANSI Color

## 3) Jenkins 에이전트 준비

CI/CD를 실행하는 Jenkins agent에 아래 명령이 있어야 합니다.

- `docker`
- `aws` (AWS CLI)
- `ssh`, `scp`
- `git`

## 4) Credentials 추가 (ID 정확히 일치)

`Manage Jenkins` -> `Credentials` -> `(global)`에 추가하세요.

공통(선택):

- Secret text: `discord-webhook-url`

Next.js 빌드 변수(CI에서 main/release 이미지 빌드 시 사용):

- Secret text: `next-public-api-base-url-staging`
- Secret text: `next-public-api-base-url-production`
- Secret text: `next-public-enable-sw`
- Secret text: `next-public-enable-middleware`
- Secret text: `next-public-firebase-api-key`
- Secret text: `next-public-firebase-auth-domain`
- Secret text: `next-public-firebase-project-id`
- Secret text: `next-public-firebase-storage-bucket`
- Secret text: `next-public-firebase-messaging-sender-id`
- Secret text: `next-public-firebase-app-id`
- Secret text: `next-public-firebase-vapid-key`

선택 항목(Analytics 쓰는 경우만):

- Secret text: `next-public-firebase-measurement-id`

ECR 푸시/풀:

- Secret text: `aws-access-key-id`
- Secret text: `aws-secret-access-key`
- Secret text: `aws-region`
- Secret text: `aws-account-id`
- Secret text: `ecr-repo` (예: `molip/fe`)

스테이징 배포(AWS, release/*):

- SSH Username with private key: `ssh-key-staging`
- Secret text: `host-staging`

운영 배포(AWS, main):

- SSH Username with private key: `ssh-key-production`
- Secret text: `host-production`

## 5) Job 생성

권장: `Multibranch Pipeline` Job 2개

- Job A: `fe-ci`
  - Script Path: `Jenkinsfile.ci`
- Job B: `fe-cd`
  - Script Path: `Jenkinsfile.cd`

브랜치 필터:

- `fe-ci`: `develop`, `main`, `release/*`, `PR-*`
- `fe-cd`: `main`, `release/*`

## 6) Webhook

GitHub 저장소 -> `Settings` -> `Webhooks` -> `Add webhook`

- Payload URL: `http://<server_ip>:8080/github-webhook/`
- Content type: `application/json`
- Events: `Push`, `Pull request`

## 7) 운영 주의사항

- CD는 이미지를 재빌드하지 않습니다. `CI`가 올린 커밋 태그 이미지를 기다렸다가 배포합니다.
- 배포 대상 서버(AWS)에도 `docker`가 설치되어 있어야 합니다.
- 운영 Blue/Green 전환에는 대상 서버에 `nginx`, `curl`, `sudo` 권한이 필요합니다.
- 운영 기본 값(`Jenkinsfile.cd`의 `environment`):
  - `PROD_BLUE_NAME=molip-fe-blue`
  - `PROD_GREEN_NAME=molip-fe-green`
  - `PROD_BLUE_PORT=3000`
  - `PROD_GREEN_PORT=3001`
  - `PROD_HEALTH_PATH=/api/example`
  - `PROD_NGINX_UPSTREAM_CONF=/etc/nginx/sites-available/molip`
- 스테이징 기본 값(`Jenkinsfile.cd`의 `environment`):
  - `STAGING_CONTAINER_NAME=molip-fe-staging`
  - `STAGING_HOST_PORT=3000`
