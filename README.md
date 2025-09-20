# NEO Regex 🚀

> 차세대 정규식 도구 - 개발자를 위한 가장 직관적이고 강력한 정규식 웹 서비스

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🎯 프로젝트 소개

NEO Regex는 개발자들이 정규식을 더 쉽고 효과적으로 사용할 수 있도록 도와주는 웹 기반 도구입니다. 복잡한 정규식 패턴을 시각적으로 구성하고, 실시간으로 테스트하며, 검증된 패턴 라이브러리를 활용할 수 있습니다.

### ✨ 주요 기능

- **🔧 정규식 테스터**: 실시간 패턴 테스트 및 결과 시각화
- **📚 패턴 라이브러리**: 검증된 정규식 패턴 모음
- **🎨 시각적 빌더**: 드래그 앤 드롭으로 정규식 구성
- **🤖 AI 어시스턴트**: 자연어로 정규식 생성 및 설명
- **📊 성능 분석**: 패턴 복잡도 및 실행 시간 측정
- **🔒 보안 검사**: ReDoS 공격 패턴 감지

## 🚀 빠른 시작

### 필요 조건

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- PostgreSQL 15 이상 (프로덕션)
- Redis 7 이상 (프로덕션, 선택사항)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/neo-regex.git
   cd neo-regex
   ```

2. **의존성 설치**
   ```bash
   # 모든 패키지 한 번에 설치
   npm run install:all
   
   # 또는 개별 설치
   npm install                    # 루트 의존성
   cd frontend && npm install     # 프론트엔드 의존성
   cd ../backend && npm install   # 백엔드 의존성
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 편집하여 필요한 환경 변수 설정
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 📁 프로젝트 구조

```
neo-regex/
├── frontend/                    # 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   │   ├── common/        # 공통 컴포넌트
│   │   │   ├── tester/        # 정규식 테스터
│   │   │   ├── library/       # 패턴 라이브러리
│   │   │   └── builder/       # 시각적 빌더
│   │   ├── core/              # 핵심 비즈니스 로직
│   │   ├── utils/             # 유틸리티 함수
│   │   ├── data/              # 정적 데이터
│   │   └── styles/            # CSS 스타일
│   ├── public/                # 정적 자원
│   └── dist/                  # 빌드 결과물
├── backend/                    # 백엔드 API 서버
│   ├── src/
│   │   ├── routes/           # API 라우트
│   │   ├── models/           # 데이터 모델
│   │   ├── middleware/       # Express 미들웨어
│   │   ├── services/         # 비즈니스 서비스
│   │   └── utils/            # 백엔드 유틸리티
│   └── config/               # 설정 파일
├── docs/                      # 프로젝트 문서
├── tests/                     # 테스트 파일
└── scripts/                   # 빌드/배포 스크립트
```

## 🛠 개발 가이드

### 사용 가능한 스크립트

```bash
# 개발
npm run dev              # 프론트엔드 + 백엔드 동시 실행
npm run dev:frontend     # 프론트엔드만 실행
npm run dev:backend      # 백엔드만 실행

# 빌드
npm run build            # 프론트엔드 빌드
npm run build:frontend   # 프론트엔드 빌드

# 테스트
npm test                 # 전체 테스트 실행
npm run test:frontend    # 프론트엔드 테스트
npm run test:backend     # 백엔드 테스트

# 코드 품질
npm run lint             # ESLint 실행
npm run lint:fix         # ESLint 자동 수정

# 데이터베이스
npm run setup:db         # 데이터베이스 마이그레이션
```

### 환경 변수

`.env.example` 파일을 참조하여 다음 환경 변수를 설정하세요:

```env
# 서버 설정
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/neoregex

# Redis (선택사항)
REDIS_URL=redis://localhost:6379

# JWT 설정
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=24h

# AI 서비스 (선택사항)
OPENAI_API_KEY=your-openai-api-key
CLAUDE_API_KEY=your-claude-api-key

# 결제 (프로덕션)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## 🧪 테스트

### 단위 테스트

```bash
# 프론트엔드 테스트
cd frontend && npm test

# 백엔드 테스트
cd backend && npm test

# 커버리지 포함
cd backend && npm run test:coverage
```

### E2E 테스트

```bash
# Cypress E2E 테스트 (개발 예정)
npm run test:e2e
```

## 🚀 배포

### 프로덕션 빌드

```bash
npm run build
```

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t neo-regex .

# Docker 컨테이너 실행
docker run -p 3000:3000 neo-regex
```

### Vercel/Netlify 배포

프론트엔드는 Vercel이나 Netlify에 쉽게 배포할 수 있습니다:

1. GitHub 저장소 연결
2. 빌드 명령어: `npm run build`
3. 배포 디렉토리: `frontend/dist`

## 📚 API 문서

API 문서는 `/docs/API.md`에서 확인할 수 있습니다.

### 주요 엔드포인트

```
GET    /health              # 서버 상태 확인
POST   /api/regex/test      # 정규식 테스트
POST   /api/regex/explain   # 패턴 설명
GET    /api/patterns        # 패턴 목록
POST   /api/patterns        # 패턴 저장
```

## 🤝 기여하기

NEO Regex 프로젝트에 기여해주셔서 감사합니다! 기여 방법:

1. 저장소를 포크합니다
2. 새로운 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 만듭니다

### 개발 가이드라인

- 코드 스타일: ESLint + Prettier 설정을 따릅니다
- 커밋 메시지: [Conventional Commits](https://conventionalcommits.org/) 형식을 따릅니다
- 테스트: 새로운 기능에는 테스트 코드를 포함해주세요

## 📖 로드맵

### Phase 1 (v1.0) - 기본 기능
- [x] 정규식 테스터
- [x] 패턴 라이브러리
- [ ] 시각적 빌더
- [ ] 사용자 인증

### Phase 2 (v1.5) - 고급 기능
- [ ] AI 어시스턴트
- [ ] 팀 협업 기능
- [ ] 성능 분석 도구

### Phase 3 (v2.0) - 확장
- [ ] 모바일 앱
- [ ] IDE 플러그인
- [ ] API 서비스

## 🐛 버그 제보

버그를 발견하셨나요? [이슈](https://github.com/your-username/neo-regex/issues)를 생성해주세요.

버그 제보시 다음 정보를 포함해주세요:
- 운영체제 및 브라우저 버전
- 재현 가능한 단계
- 예상 결과와 실제 결과
- 스크린샷 (해당하는 경우)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발팀**: NEO Regex Development Team
- **이메일**: contact@neoregex.com
- **웹사이트**: https://neoregex.com

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [Express.js](https://expressjs.com/) - 백엔드 프레임워크
- [Vite](https://vitejs.dev/) - 빌드 도구
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Lucide](https://lucide.dev/) - 아이콘 세트

---

**NEO Regex**로 정규식을 더 쉽고 재미있게 사용해보세요! 🎉

[![GitHub stars](https://img.shields.io/github/stars/your-username/neo-regex.svg?style=social&label=Star)](https://github.com/your-username/neo-regex)
[![GitHub forks](https://img.shields.io/github/forks/your-username/neo-regex.svg?style=social&label=Fork)](https://github.com/your-username/neo-regex/fork)