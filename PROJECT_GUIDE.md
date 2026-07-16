# 집세권 프로젝트 안내서

이 문서는 프로젝트의 기술 구성, 폴더 역할, 실행 및 배포 방법을 나중에 다시 확인하기 위한 문서입니다.

현재 배포된 웹사이트: [https://walkable-jib-zone.vercel.app/](https://walkable-jib-zone.vercel.app/)

## 1. 이 프로젝트는 무엇인가요?

이 프로젝트는 Flutter 앱이 아니라 **React 기반 웹앱**입니다.

- 언어: TypeScript (`.ts`, `.tsx`)
- 화면: React 19
- 프레임워크: TanStack Start
- 페이지 이동: TanStack Router
- 개발 및 빌드: Vite
- 스타일: Tailwind CSS 4
- UI 컴포넌트: Radix UI
- 아이콘: Lucide React
- 서버 빌드: Nitro
- 배포 대상: Vercel

현재는 실제 데이터베이스나 지도 API를 사용하지 않습니다. 샘플 아파트 데이터는 `src/lib/apartments-data.ts`에 직접 들어 있습니다.

## 2. 화면이 동작하는 구조

이 프로젝트는 SSR(Server-Side Rendering)을 사용합니다.

```text
사용자가 페이지 요청
→ Vercel 서버가 React 화면을 HTML로 생성
→ 브라우저에 HTML 전달
→ JavaScript가 연결됨
→ 검색, 필터, 버튼, 화면 이동 작동
```

개발 중에는 Vite 개발 서버가 이 역할을 대신합니다.

## 3. 주요 폴더

```text
jipzone-frontend/
├── src/                    실제로 수정하는 앱 코드
│   ├── routes/             URL별 페이지
│   ├── components/         공통 화면 부품
│   ├── components/ui/      버튼, 입력창 등 기본 UI
│   ├── hooks/              React 공통 훅
│   ├── lib/                데이터와 공통 함수
│   ├── router.tsx          라우터 생성
│   ├── start.ts            TanStack Start 서버 설정
│   ├── server.ts           SSR 서버와 오류 처리
│   └── styles.css          전체 스타일
├── public/                 favicon 같은 정적 파일
├── scripts/                설치 후 실행되는 보정 스크립트
├── .lovable/               Lovable 프로젝트 정보
├── .output/                과거/기본 Nitro 빌드 결과
├── .vercel/                Vercel용 빌드 결과
├── node_modules/           설치된 라이브러리
├── package.json            명령과 라이브러리 목록
├── vite.config.ts          Vite, TanStack, Vercel 설정
└── tsconfig.json           TypeScript 설정
```

평소에는 `src/` 아래의 파일을 수정하면 됩니다.

## 4. 페이지와 URL

| 파일 | URL | 역할 |
| --- | --- | --- |
| `src/routes/index.tsx` | `/` | 첫 화면과 주소 검색 |
| `src/routes/find.tsx` | `/find` | 도보 시간과 시설 선택 |
| `src/routes/analyze.tsx` | `/analyze` | 분석 진행 화면 |
| `src/routes/results.tsx` | `/results` | 검색 결과 |
| `src/routes/map.tsx` | `/map` | 지도 형태 결과 |
| `src/routes/apartment.$id.tsx` | `/apartment/:id` | 아파트 상세 |
| `src/routes/__root.tsx` | 모든 페이지 | 공통 HTML과 오류 화면 |

`src/routeTree.gen.ts`는 페이지 파일을 기반으로 자동 생성됩니다. 직접 수정하지 않습니다.

## 5. 자동 생성 폴더

### `.lovable`

Lovable 템플릿 및 연결 정보를 보관합니다.

- Vercel 실행에는 필요하지 않습니다.
- Lovable을 계속 사용할 예정이면 유지합니다.
- Lovable을 완전히 사용하지 않을 예정이면 삭제할 수 있습니다.

### `.output`

Nitro 빌드 결과입니다.

- 직접 수정하지 않습니다.
- 삭제해도 다시 빌드하면 생성됩니다.
- GitHub에는 올라가지 않습니다.

### `.vercel`

Vercel용 빌드 결과입니다.

- `npm run build`가 자동 생성합니다.
- `static/`에는 브라우저용 파일이 들어갑니다.
- `functions/`에는 SSR 서버 함수가 들어갑니다.
- 직접 수정하거나 GitHub에 올리지 않습니다.

### `node_modules`

`npm install`로 설치된 라이브러리입니다. 용량이 크며 삭제해도 `npm install`로 다시 만들 수 있습니다.

## 6. 처음 설치하기

Node.js 22가 필요합니다.

```bash
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

node -v
npm -v
```

`node -v`가 `v22.x.x`로 나오면 정상입니다.

개발용 패키지를 포함해 설치합니다.

```bash
cd /Users/ihaeni/dev/jipzone-frontend
npm install --include=dev
```

VS Code에서 타입 관련 빨간 줄이 남으면 다음을 실행합니다.

1. `Cmd + Shift + P`
2. `TypeScript: Select TypeScript Version`
3. `Use Workspace Version`
4. `Developer: Reload Window`

## 7. 로컬 실행

```bash
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```text
http://127.0.0.1:8080
```

주요 명령은 다음과 같습니다.

```bash
npm run dev       # 개발 서버 실행
npm run build     # Vercel 배포 파일 생성
npm run preview   # 빌드 결과 미리보기
npm run lint      # 코드 검사
npm run format    # 코드 자동 정리
```

## 8. Vercel 배포 설정

GitHub 저장소를 Vercel에 연결한 후 다음과 같이 설정합니다.

```text
Root Directory: 비워두기 또는 ./
Framework Preset: Other
Install Command: npm install
Build Command: npm run build
Output Directory: 비워두기
Node.js Version: 22.x
```

`vite.config.ts`에서 Nitro의 `vercel` preset을 사용합니다. 빌드 결과는 `.vercel/output`에 자동 생성되므로 Output Directory를 직접 지정하지 않습니다.

GitHub에 새 커밋을 push하면 Vercel이 자동으로 다시 배포합니다.

## 9. 모바일 앱으로 출시할 수 있나요?

현재 프로젝트는 웹앱이지만 모바일 앱 형태로 확장할 수 있습니다.

### PWA

홈 화면에 설치할 수 있는 웹앱으로 만드는 방식입니다.

- 기존 코드를 대부분 유지할 수 있습니다.
- 앱스토어 없이 설치할 수 있습니다.
- 작업량이 비교적 적습니다.
- 일반적인 앱스토어 검색에는 노출되지 않습니다.

### Capacitor

현재 React 웹앱을 iOS 및 Android 앱 컨테이너로 감싸는 방식입니다.

- 기존 React 코드를 대부분 유지할 수 있습니다.
- App Store와 Google Play에 출시할 수 있습니다.
- 위치, 카메라, 알림 같은 휴대폰 기능을 연결할 수 있습니다.
- iOS 빌드에는 Mac과 Xcode가 필요합니다.
- Android 빌드에는 Android Studio가 필요합니다.
- Apple 및 Google 개발자 계정과 스토어 심사가 필요합니다.

Flutter로 바꾸려면 Dart 언어로 화면을 거의 전부 다시 작성해야 합니다. 현재 프로젝트에는 Capacitor 방식이 더 현실적입니다.

추천 진행 순서는 다음과 같습니다.

```text
React 웹앱 완성
→ Vercel에서 모바일 웹 테스트
→ 필요하면 PWA 적용
→ 스토어 출시가 필요하면 Capacitor 적용
```

## 10. 기억할 것

- 실제 수정 대상은 대부분 `src/`입니다.
- `routeTree.gen.ts`와 빌드 결과 폴더는 직접 수정하지 않습니다.
- 현재 데이터는 실제 부동산 데이터가 아니라 코드에 들어 있는 샘플입니다.
- 패키지 설치와 실행에는 Node.js 22를 사용합니다.
- GitHub는 소스코드 저장 및 변경 이력 관리 용도입니다.
- Vercel은 실제 웹사이트를 인터넷에서 실행하는 서버 역할을 합니다.

## 11. `AGENTS.md`는 무엇인가요?

`AGENTS.md`는 앱에서 실행되는 파일이 아니라 Codex 같은 AI 작업자를 위한 저장소 작업 규칙입니다.

현재 문서에는 이 프로젝트가 Lovable과 연결되어 있으므로 이미 배포된 Git 기록을 강제로 변경하지 말라는 내용이 들어 있습니다. 예를 들어 force push, 이미 push한 커밋의 rebase, amend, squash 등을 피하도록 안내합니다.

- 앱 화면이나 Vercel 배포 결과에는 포함되지 않습니다.
- 사용자가 읽는 서비스 설명서가 아닙니다.
- AI가 코드를 수정하거나 Git을 다룰 때 참고합니다.
- 특별한 이유가 없다면 그대로 유지하는 것이 좋습니다.
