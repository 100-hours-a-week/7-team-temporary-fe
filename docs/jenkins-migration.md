# Jenkins Migration Guide (from GitHub Actions)

이 문서는 `/Users/dokkang/Projects/KakaoTech/molip/fe/7-team-temporary-fe/.github/workflows/fe-bigbang-ci.yaml`과 `/Users/dokkang/Projects/KakaoTech/molip/fe/7-team-temporary-fe/.github/workflows/fe-bigbang-cd.yaml`를 Jenkins로 옮기는 최소 절차입니다.

## 1) Jenkins 플러그인

아래 플러그인을 설치하세요.

- Pipeline
- Git
- GitHub Branch Source
- Credentials Binding
- (선택) NodeJS
- (선택) ANSI Color

## 2) Jenkins 실행 노드 준비

현재 `Jenkinsfile`은 NodeJS plugin 없이도 동작합니다. 대신 Jenkins agent(실행 노드)에 아래 명령이 있어야 합니다.

- `node` (권장: v22)
- `corepack`

NodeJS plugin을 쓰고 싶다면 설치 후 Global Tool로 Node 22를 추가해도 됩니다.

## 3) Credentials 추가 (ID는 아래와 동일하게)

`Manage Jenkins` -> `Credentials` -> `(global)`에 추가하세요.

공통:

- Secret text: `discord-webhook-url`

CD Build 환경:

- Secret text: `next-public-api-base-url-staging`
- Secret text: `next-public-api-base-url-production`
- Secret text: `next-public-enable-sw`
- Secret text: `next-public-firebase-api-key`
- Secret text: `next-public-firebase-auth-domain`
- Secret text: `next-public-firebase-project-id`
- Secret text: `next-public-firebase-storage-bucket`
- Secret text: `next-public-firebase-messaging-sender-id`
- Secret text: `next-public-firebase-app-id`
- Secret text: `next-public-firebase-vapid-key`

CD Deploy (AWS):

- SSH Username with private key: `ssh-key-staging`
- Secret text: `host-staging`
- Secret text: `app-dir-aws`
- Secret text: `pm2-name`

CD Deploy (GCP):

- Secret file (Service Account JSON): `gcp-service-account-json`
- Secret text: `gcp-project-id`
- Secret text: `gcp-zone`
- Secret text: `gce-instance-name`
- Secret text: `gce-user`
- Secret text: `app-dir-gcp`

## 4) Job 생성

권장: `Multibranch Pipeline` Job 2개를 만드세요.

- Job A: `fe-ci`
  - Script Path: `Jenkinsfile.ci`
- Job B: `fe-cd`
  - Script Path: `Jenkinsfile.cd`

각 Job의 Branch Source는 같은 GitHub 저장소를 바라보게 설정하세요.

브랜치 필터를 다음처럼 맞추면 GitHub Actions와 거의 동일하게 동작합니다.

- `fe-ci`: `develop`, `main`, `release/*`, PR
- `fe-cd`: `main`, `release/*`

## 5) Webhook

GitHub 저장소 Settings -> Webhooks -> Add webhook

- Payload URL: `http://<server_ip>:8080/github-webhook/`
- Content type: `application/json`
- Events: Push, Pull request

## 6) Jenkins 에이전트 사전 설치 항목

`Jenkinsfile.cd`를 실행하는 에이전트에는 아래 명령이 필요합니다.

- `ssh`, `scp`
- `gcloud` (GCP 배포용)
- `node`, `corepack` (또는 Jenkins NodeJS Tool로 제공)

AWS 서버가 사설망이라면 Jenkins 에이전트 네트워크에서 SSH 접근이 가능해야 합니다. (기존 GitHub Actions의 Tailscale 단계 역할)

## 7) 실행 흐름

- `fe-ci`
  - PR: install -> lint -> build
  - push(main/release): install -> build -> audit
- `fe-cd`
  - push(release/*): build + 패키징 + AWS 배포
  - push(main): build + 패키징 + GCP 배포
  - 모든 결과는 Discord로 알림
