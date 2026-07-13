# My Assistant — 프론트엔드

문서 기반 AI 채팅 서비스의 프론트엔드입니다. 사용자가 문서를 업로드하면 해당 문서를 바탕으로 AI가 실시간 스트리밍 방식으로 답변합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.9 (App Router) |
| UI 라이브러리 | React 19 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| UI 컴포넌트 | shadcn/ui (Radix UI) |
| 상태 관리 | Zustand |
| 폼 유효성 | React Hook Form + Zod |
| HTTP 클라이언트 | Axios |
| AI 스트리밍 | Fetch API (SSE) |

## 주요 기능

- **JWT 인증** — 로그인/회원가입 후 토큰을 localStorage에 저장하고, Axios 인터셉터로 모든 요청에 자동 첨부
- **소셜 로그인** — 카카오, 네이버, Google OAuth2 로그인 지원
- **AI 스트리밍 채팅** — SSE(Server-Sent Events) 방식으로 AI 응답을 토큰 단위로 실시간 수신
- **문서 업로드** — PDF, DOCX, TXT 파일 업로드 시 백엔드에서 비동기 인덱싱 후 문서 기반 답변 제공
- **인증 상태 복원** — 페이지 새로고침 시 localStorage에서 인증 상태를 자동 복원

## 프로젝트 구조

```
myassistant-frontend/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (AuthProvider 적용)
│   ├── page.tsx                # 루트 → /chat 리다이렉트
│   ├── login/page.tsx          # 로그인 페이지
│   ├── register/page.tsx       # 회원가입 페이지
│   ├── chat/page.tsx           # AI 채팅 페이지
│   └── auth/callback/page.tsx  # 소셜 로그인 OAuth 콜백
├── components/
│   ├── AuthProvider.tsx        # 앱 초기 로드 시 인증 상태 복원
│   ├── DocumentUploadDialog.tsx # 문서 업로드 다이얼로그
│   ├── SocialLoginButtons.tsx  # 소셜 로그인 버튼 목록
│   └── ui/                    # shadcn/ui 기본 컴포넌트
├── store/
│   ├── authStore.ts            # 인증 상태 (Zustand)
│   └── chatStore.ts            # 채팅 메시지 상태 (Zustand)
└── lib/
    ├── utils.ts
    └── api/
        ├── client.ts           # Axios 인스턴스 + JWT 인터셉터
        ├── auth.ts             # 회원가입/로그인 API
        ├── chat.ts             # SSE 스트리밍 채팅 API
        └── document.ts         # 문서 업로드 API
```

## 페이지 흐름

```
/  →  /chat (비로그인 시 /login으로 리다이렉트)

/login       로그인 (일반 + 소셜)
/register    회원가입
/chat        AI 채팅 (인증 필요)
/auth/callback  소셜 로그인 콜백 (JWT 추출 후 /chat 이동)
```

## 환경 변수

`.env.local` 파일을 생성하고 아래 변수를 설정합니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## API 연동

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/chat/stream` | SSE 스트리밍 채팅 |
| POST | `/api/documents/upload` | 문서 업로드 |
| GET/POST | `/oauth2/authorization/:provider` | 소셜 로그인 (카카오/네이버/Google) |

소셜 로그인은 백엔드가 OAuth2 인증 완료 후 `/auth/callback?token=<JWT>` 로 리다이렉트합니다.
