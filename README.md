# NEO Regex 🚀

> 차세대 정규식 도구 - 개발자를 위한 가장 직관적이고 강력한 정규식 웹 서비스

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://neoregex.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<p align="center">
  <img src="./assets/preview.png" alt="NEO Regex Preview" width="800">
</p>

## 🎯 프로젝트 소개

**NEO Regex**는 개발자들이 정규식을 더 쉽고 효과적으로 사용할 수 있도록 도와주는 웹 기반 도구입니다. 복잡한 정규식 패턴을 실시간으로 테스트하고, 검증된 패턴 라이브러리를 활용하며, 시각적 인터페이스로 패턴을 구성할 수 있습니다.

### ✨ 주요 기능

- **🔬 실시간 정규식 테스터** - 패턴을 입력하면 즉시 매칭 결과를 시각적으로 확인
- **📚 85개 검증된 패턴 라이브러리** - 이메일, 전화번호, URL 등 실무에서 자주 쓰이는 패턴 제공
- **🎨 시각적 빌더** - 드래그 앤 드롭으로 직관적인 패턴 생성 (개발 중)
- **🚀 전문가 도구** - 패턴 분석, 성능 측정, ReDoS 탐지
- **📖 초보자 가이드** - 정규식 기초부터 고급 기법까지 7단계 학습
- **💾 자동 저장** - 로컬 스토리지를 활용한 작업 내용 자동 보존

### 🎓 대상 사용자

- 정규식을 배우고 싶은 초보 개발자
- 빠르게 패턴을 테스트하고 싶은 중급 개발자
- 복잡한 정규식을 분석하고 최적화하려는 전문가

---

## 🚀 빠른 시작

### 온라인에서 바로 사용하기

**설치 없이 웹 브라우저에서 바로 사용할 수 있습니다!**

👉 [https://neoregex.com](https://neoregex.com)

### 로컬에서 실행하기

#### 필요 조건

- 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- Live Server (개발 시) 또는 정적 웹 서버

#### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/gamebini/neo-regex.git
cd neo-regex

# 2. Live Server로 실행 (VS Code 확장 프로그램)
# - VS Code에서 index.html 우클릭
# - "Open with Live Server" 선택

# 또는 Python 내장 서버 사용
python -m http.server 8000

# 또는 Node.js http-server 사용
npx http-server -p 8000
```

브라우저에서 `http://localhost:8000` 접속

---

## 📁 프로젝트 구조

```
neo-regex/
├── index.html                  # 메인 페이지
├── tester/                     # 정규식 테스터
│   └── index.html
├── library/                    # 패턴 라이브러리
│   └── index.html
├── builder/                    # 시각적 빌더
│   └── index.html
├── expert/                     # 전문가 도구
│   └── index.html
├── beginner/                   # 초보자 가이드
│   └── index.html
├── docs/                       # 문서 (이용약관, 개인정보처리방침)
│   └── index.html
├── src/
│   ├── scripts/               # JavaScript 파일
│   │   ├── main.js           # 공통 기능
│   │   ├── tester.js         # 테스터 로직
│   │   ├── library.js        # 라이브러리 관리
│   │   ├── builder.js        # 빌더 기능
│   │   ├── expert.js         # 전문가 도구
│   │   ├── beginner.js       # 가이드 로직
│   │   ├── docs.js           # 문서 페이지
│   │   └── patterns.js       # 패턴 데이터 (fallback)
│   ├── styles/                # CSS 파일
│   │   ├── main.css          # 기본 스타일
│   │   ├── components.css    # 컴포넌트
│   │   ├── tester.css        # 테스터 전용
│   │   ├── library.css       # 라이브러리 전용
│   │   ├── builder.css       # 빌더 전용
│   │   ├── expert.css        # 전문가 도구 전용
│   │   ├── guide.css         # 가이드 전용
│   │   ├── docs.css          # 문서 전용
│   │   └── utilities.css     # 유틸리티
│   └── data/
│       └── patterns.json      # 85개 검증된 패턴 데이터
├── assets/                     # 이미지, 아이콘 등
├── favicon-16x16.ico
├── favicon-32x32.ico
├── favicon-48x48.ico
├── README.md
└── LICENSE
```

---

## 🛠 기술 스택

### 프론트엔드
- **HTML5** - 시맨틱 마크업
- **CSS3** - Flexbox, Grid, CSS Variables, Animations
- **Vanilla JavaScript (ES6+)** - 순수 자바스크립트 (프레임워크 없음)

### 데이터 저장
- **LocalStorage** - 사용자 설정 및 작업 내역 저장
- **JSON** - 정적 패턴 데이터 관리

### 외부 라이브러리
- **Font Awesome 6.4.0** - 아이콘
- **Google Fonts (Inter, JetBrains Mono)** - 웹 폰트

### 특징
- ✅ **백엔드 불필요** - 완전한 클라이언트 사이드 애플리케이션
- ✅ **데이터베이스 불필요** - LocalStorage 활용
- ✅ **빠른 배포** - 정적 파일만으로 어디서든 호스팅 가능
- ✅ **개인정보 수집 없음** - 모든 데이터는 사용자 브라우저에만 저장

---

## 🎮 주요 기능 상세

### 1️⃣ 정규식 테스터
- 실시간 패턴 매칭 및 하이라이트
- 플래그 지원 (g, i, m, s, u, y)
- 매칭 통계 (개수, 위치)
- 패턴 복사/공유 기능
- 히스토리 관리

### 2️⃣ 패턴 라이브러리
- **85개의 검증된 정규식 패턴**
  - 기본 패턴 (이메일, URL, 전화번호 등)
  - 검증 패턴 (비밀번호, 날짜, 숫자 등)
  - 한국어 패턴 (한글, 주민번호, 사업자번호 등)
  - 개발자 패턴 (HTML, CSS, JavaScript 등)
- 카테고리별 필터링
- 난이도별 정렬
- 검색 기능
- 즐겨찾기
- 그리드/리스트 뷰 전환

### 3️⃣ 시각적 빌더 (개발 중)
- 드래그 앤 드롭 인터페이스
- 컴포넌트 기반 패턴 구성
- 실시간 정규식 생성
- 패턴 설명 자동 생성

### 4️⃣ 전문가 도구
- **패턴 분석기** - 복잡도 및 구조 분석
- **성능 모니터** - 실행 시간 측정
- **ReDoS 탐지** - 보안 취약점 검사
- **패턴 최적화** - 성능 개선 제안
- **정규식 생성기** - 조건 기반 자동 생성

### 5️⃣ 초보자 가이드
- **7단계 학습 과정**
  1. 정규식이란?
  2. 기본 문자 매칭
  3. 특수 문자와 이스케이프
  4. 문자 클래스
  5. 수량자
  6. 앵커와 경계
  7. 실전 연습
- 각 레슨마다 실습 예제 포함
- 진행도 추적
- 테스터와 연동

---

## 🚀 배포

### GitHub Pages

```bash
# 1. GitHub 저장소 생성 및 푸시
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/neo-regex.git
git push -u origin main

# 2. GitHub Pages 설정
# Settings > Pages > Source: main branch / root
```

### Netlify

```bash
# 1. Netlify CLI 설치
npm install -g netlify-cli

# 2. 로그인
netlify login

# 3. 배포
netlify deploy --prod
```

**또는 Netlify 웹 인터페이스에서:**
1. https://app.netlify.com 접속
2. "Add new site" > "Import an existing project"
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build command: (비워두기)
   - Publish directory: `/`
5. Deploy!

### Vercel

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 기타 호스팅 서비스
- **GitHub Pages** - 무료, 간편한 GitHub 통합
- **Netlify** - 무료, 자동 배포, 커스텀 도메인
- **Vercel** - 무료, 빠른 배포
- **Cloudflare Pages** - 무료, 글로벌 CDN
- **Firebase Hosting** - Google의 호스팅 서비스

모두 정적 파일 호스팅이므로 추가 설정 없이 바로 배포 가능합니다!

---

## 📚 사용 가이드

### 기본 사용법

1. **패턴 테스트하기**
   ```
   홈 > 테스터 메뉴 클릭
   → 정규식 패턴 입력
   → 테스트 텍스트 입력
   → 실시간으로 매칭 결과 확인
   ```

2. **패턴 라이브러리 활용**
   ```
   홈 > 라이브러리 메뉴 클릭
   → 카테고리 또는 검색으로 패턴 찾기
   → 패턴 카드 클릭하여 상세 보기
   → "테스터에서 사용" 버튼으로 즉시 테스트
   ```

3. **정규식 학습**
   ```
   홈 > 튜토리얼 메뉴 클릭
   → 레슨 1부터 순차적으로 학습
   → 각 레슨의 실습 문제 풀기
   → 다음 레슨으로 진행
   ```

### 고급 기능

- **패턴 저장**: 테스터에서 작성한 패턴은 자동으로 로컬에 저장됩니다
- **즐겨찾기**: 라이브러리에서 자주 쓰는 패턴을 즐겨찾기에 추가
- **패턴 공유**: 테스터에서 "공유" 버튼으로 URL 생성

---

## 🤝 기여하기

NEO Regex 프로젝트에 기여해주셔서 감사합니다! 

### 기여 방법

1. 저장소를 Fork 합니다
2. 새로운 기능 브랜치를 만듭니다
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 변경사항을 커밋합니다
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. 브랜치에 푸시합니다
   ```bash
   git push origin feature/amazing-feature
   ```
5. Pull Request를 생성합니다

### 기여 가이드라인

- **코드 스타일**: 기존 코드의 스타일을 따라주세요
- **커밋 메시지**: 명확하고 설명적인 커밋 메시지 작성
- **문서화**: 새로운 기능은 README에 문서화
- **테스트**: 변경사항이 기존 기능을 깨트리지 않는지 확인

### 기여할 수 있는 영역

- 🐛 버그 수정
- ✨ 새로운 정규식 패턴 추가
- 📝 문서 개선
- 🌍 다국어 지원
- 🎨 UI/UX 개선
- ⚡ 성능 최적화

---

## 🗺 로드맵

### ✅ Phase 1 (현재) - MVP 완성
- [x] 정규식 테스터 구현
- [x] 85개 패턴 라이브러리
- [x] 초보자 가이드 (7단계)
- [x] 전문가 도구 기본 기능
- [x] 반응형 디자인

### 🚧 Phase 2 (진행 중) - 고급 기능
- [ ] 시각적 빌더 완성
- [ ] AI 기반 패턴 생성
- [ ] 패턴 설명 자동 생성
- [ ] 코드 생성기 (Python, Java, PHP 등)
- [ ] 더 많은 패턴 추가 (200개 목표)

### 📅 Phase 3 (계획) - 확장
- [ ] 브라우저 확장 프로그램
- [ ] VS Code 확장
- [ ] 모바일 앱
- [ ] 커뮤니티 패턴 공유
- [ ] 다국어 지원 (영어, 일본어 등)

---

## 🐛 버그 제보

버그를 발견하셨나요? [이슈 생성](https://github.com/gamebini/neo-regex/issues)

**버그 제보 시 포함할 정보:**
- 운영체제 (Windows, macOS, Linux)
- 브라우저 및 버전 (Chrome 120, Firefox 121 등)
- 재현 가능한 단계
- 예상 결과 vs 실제 결과
- 스크린샷 (선택사항)

---

## 💬 문의 및 지원

- **이메일**: [Discord](https://discord.com/users/680379234459582484)
- **GitHub Issues**: [문제 제기](https://github.com/gamebini/neo-regex/issues)
- **Instagram**: [@bb_.xx._ii](https://www.instagram.com/bb_.xx._ii/)

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다.

자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2024 NEO Regex

상업적 사용, 수정, 배포, 사적 사용 모두 자유롭게 가능합니다.
```

---

## 👏 감사의 말

이 프로젝트를 만드는 데 도움을 준 오픈소스 프로젝트들:

- [Font Awesome](https://fontawesome.com/) - 아이콘
- [Google Fonts](https://fonts.google.com/) - 웹 폰트 (Inter, JetBrains Mono)
- [MDN Web Docs](https://developer.mozilla.org/) - 정규식 문서
- [regex101](https://regex101.com/) - 영감을 준 정규식 도구

---

## 📊 프로젝트 통계

- **85개** 검증된 정규식 패턴
- **7개** 주요 페이지
- **5가지** 카테고리 (기본, 검증, 한국어, 개발자, 소셜)
- **3가지** 난이도 (쉬움, 보통, 어려움)
- **100%** 클라이언트 사이드 (백엔드 불필요)
- **0원** 호스팅 비용 (정적 호스팅 무료)

---

## 🌟 별점 주기

이 프로젝트가 도움이 되었다면 ⭐️ 별점을 눌러주세요!

[![GitHub stars](https://img.shields.io/github/stars/gamebini/neo-regex.svg?style=social&label=Star)](https://github.com/gamebini/neo-regex)
[![GitHub forks](https://img.shields.io/github/forks/gamebini/neo-regex.svg?style=social&label=Fork)](https://github.com/gamebini/neo-regex/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/gamebini/neo-regex.svg?style=social&label=Watch)](https://github.com/gamebini/neo-regex)

---

<p align="center">
  <strong>NEO Regex</strong>로 정규식을 더 쉽고 재미있게! 🎉
  <br><br>
  Made with ❤️ by NEO Regex Team
  <br><br>
  <a href="https://neoregex.com">웹사이트</a> •
  <a href="https://github.com/gamebini/neo-regex">GitHub</a> •
  <a href="https://github.com/gamebini/neo-regex/issues">이슈</a>
</p>