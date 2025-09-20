#!/bin/bash
# scripts/setup.sh
# NEO Regex 개발 환경 자동 설정 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 로그 함수들
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# 설정 시작
echo "=================================================="
echo "🚀 NEO Regex 개발 환경 설정"
echo "=================================================="

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

# Node.js 버전 확인
check_node_version() {
    log_step "Node.js 버전 확인 중..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다."
        log_info "https://nodejs.org 에서 Node.js 18 이상을 설치해주세요."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    REQUIRED_MAJOR=18
    CURRENT_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    
    if [ "$CURRENT_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
        log_error "Node.js $REQUIRED_MAJOR 이상이 필요합니다. 현재: $NODE_VERSION"
        exit 1
    fi
    
    log_success "Node.js 버전 확인 완료: $NODE_VERSION"
}

# npm 버전 확인
check_npm_version() {
    log_step "npm 버전 확인 중..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    log_success "npm 버전 확인 완료: $NPM_VERSION"
}

# Git 확인
check_git() {
    log_step "Git 설정 확인 중..."
    
    if ! command -v git &> /dev/null; then
        log_warning "Git이 설치되지 않았습니다. Git 설치를 권장합니다."
    else
        GIT_VERSION=$(git --version)
        log_success "Git 확인 완료: $GIT_VERSION"
    fi
}

# 환경 변수 파일 생성
setup_env_files() {
    log_step "환경 변수 파일 설정 중..."
    
    # 루트 .env 파일
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success ".env 파일이 생성되었습니다."
        else
            log_warning ".env.example 파일을 찾을 수 없습니다."
        fi
    else
        log_info ".env 파일이 이미 존재합니다."
    fi
    
    # 프론트엔드 .env 파일
    if [ -d "frontend" ] && [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=NEO Regex
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
EOF
        log_success "프론트엔드 .env 파일이 생성되었습니다."
    fi
    
    # 백엔드 .env 파일
    if [ -d "backend" ] && [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Backend Environment Variables
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/neoregex_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-this-in-production
JWT_EXPIRE=24h
LOG_LEVEL=debug
LOG_TO_FILE=true

# Email (optional for development)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# API Keys (optional)
# OPENAI_API_KEY=your-openai-api-key
# CLAUDE_API_KEY=your-claude-api-key

# Development settings
ENABLE_CORS=true
ENABLE_DEBUG=true
MOCK_APIS=false
EOF
        log_success "백엔드 .env 파일이 생성되었습니다."
    fi
}

# 의존성 설치
install_dependencies() {
    log_step "의존성 설치 중..."
    
    # 루트 의존성
    if [ -f "package.json" ]; then
        log_info "루트 의존성 설치 중..."
        npm install
        log_success "루트 의존성 설치 완료"
    fi
    
    # 프론트엔드 의존성
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        log_info "프론트엔드 의존성 설치 중..."
        cd frontend
        npm install
        cd ..
        log_success "프론트엔드 의존성 설치 완료"
    fi
    
    # 백엔드 의존성
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        log_info "백엔드 의존성 설치 중..."
        cd backend
        npm install
        cd ..
        log_success "백엔드 의존성 설치 완료"
    fi
}

# Git hooks 설정
setup_git_hooks() {
    if [ -d ".git" ]; then
        log_step "Git hooks 설정 중..."
        
        # pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for NEO Regex

echo "🔍 Pre-commit checks..."

# 린팅 검사
if [ -f "frontend/package.json" ]; then
    echo "Frontend 린팅 검사 중..."
    cd frontend && npm run lint
    if [ $? -ne 0 ]; then
        echo "❌ Frontend 린팅 검사 실패"
        exit 1
    fi
    cd ..
fi

if [ -f "backend/package.json" ]; then
    echo "Backend 린팅 검사 중..."
    cd backend && npm run lint
    if [ $? -ne 0 ]; then
        echo "❌ Backend 린팅 검사 실패"
        exit 1
    fi
    cd ..
fi

echo "✅ Pre-commit checks 통과"
EOF
        
        chmod +x .git/hooks/pre-commit
        log_success "Git pre-commit hook 설정 완료"
    fi
}

# 개발 도구 설치 권장
recommend_dev_tools() {
    log_step "개발 도구 권장사항..."
    
    echo ""
    log_info "📝 권장 개발 도구:"
    
    # Docker 확인
    if command -v docker &> /dev/null; then
        log_success "Docker 설치됨 ✓"
    else
        log_warning "Docker 미설치 - 데이터베이스 및 Redis 실행을 위해 설치 권장"
        log_info "   설치: https://docs.docker.com/get-docker/"
    fi
    
    # Docker Compose 확인
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        log_success "Docker Compose 설치됨 ✓"
    else
        log_warning "Docker Compose 미설치"
    fi
    
    # PostgreSQL 확인
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL 클라이언트 설치됨 ✓"
    else
        log_info "PostgreSQL 클라이언트 미설치 (선택사항)"
    fi
    
    # Redis 확인
    if command -v redis-cli &> /dev/null; then
        log_success "Redis 클라이언트 설치됨 ✓"
    else
        log_info "Redis 클라이언트 미설치 (선택사항)"
    fi
    
    echo ""
    log_info "🔧 권장 VS Code 확장프로그램:"
    log_info "   - ES7+ React/Redux/React-Native snippets"
    log_info "   - Prettier - Code formatter"
    log_info "   - ESLint"
    log_info "   - Tailwind CSS IntelliSense"
    log_info "   - Thunder Client (API 테스팅)"
    log_info "   - GitLens"
}

# 스크립트 실행 권한 설정
setup_scripts() {
    log_step "스크립트 실행 권한 설정 중..."
    
    if [ -f "scripts/build.sh" ]; then
        chmod +x scripts/build.sh
    fi
    
    if [ -f "scripts/deploy.sh" ]; then
        chmod +x scripts/deploy.sh
    fi
    
    if [ -f "scripts/setup.sh" ]; then
        chmod +x scripts/setup.sh
    fi
    
    log_success "스크립트 실행 권한 설정 완료"
}

# 개발 서버 실행 안내
show_next_steps() {
    echo ""
    echo "=================================================="
    log_success "🎉 개발 환경 설정이 완료되었습니다!"
    echo "=================================================="
    
    echo ""
    log_info "📋 다음 단계:"
    echo ""
    
    log_info "1️⃣  데이터베이스 설정 (Docker 사용):"
    echo "   docker-compose up -d postgres redis"
    echo ""
    
    log_info "2️⃣  개발 서버 실행:"
    echo "   npm run dev"
    echo ""
    
    log_info "3️⃣  개별 서버 실행 (선택사항):"
    echo "   프론트엔드: npm run dev:frontend"
    echo "   백엔드:     npm run dev:backend"
    echo ""
    
    log_info "4️⃣  접속 URL:"
    echo "   프론트엔드: http://localhost:5173"
    echo "   백엔드 API: http://localhost:3001"
    echo "   헬스체크:   http://localhost:3001/health"
    echo ""
    
    log_info "5️⃣  데이터베이스 관리 (Docker 사용 시):"
    echo "   pgAdmin:        http://localhost:5050"
    echo "   Redis Commander: http://localhost:8081"
    echo ""
    
    log_info "🔧 유용한 명령어:"
    echo "   빌드:       npm run build"
    echo "   테스트:     npm test"
    echo "   린팅:       npm run lint"
    echo "   린팅 수정:  npm run lint:fix"
    echo ""
    
    log_info "📚 추가 정보:"
    echo "   - README.md 파일을 확인하세요"
    echo "   - docs/ 폴더에서 상세 가이드를 확인하세요"
    echo "   - 문제가 있으면 GitHub Issues를 이용하세요"
    echo ""
    
    log_warning "⚠️  주의사항:"
    echo "   - .env 파일의 JWT_SECRET을 프로덕션에서는 반드시 변경하세요"
    echo "   - 데이터베이스 비밀번호를 프로덕션에서는 반드시 변경하세요"
    echo ""
}

# 에러 핸들링
trap 'log_error "설정 중 오류가 발생했습니다."; exit 1' ERR

# 메인 설정 함수
main() {
    check_node_version
    check_npm_version
    check_git
    setup_env_files
    install_dependencies
    setup_git_hooks
    setup_scripts
    recommend_dev_tools
    show_next_steps
}

# 옵션 처리
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --docker-only)
            DOCKER_ONLY=true
            shift
            ;;
        --help)
            echo "NEO Regex 개발 환경 설정 스크립트"
            echo ""
            echo "사용법: $0 [옵션]"
            echo ""
            echo "옵션:"
            echo "  --skip-deps     의존성 설치 생략"
            echo "  --docker-only   Docker 환경만 설정"
            echo "  --help          이 도움말 표시"
            echo ""
            exit 0
            ;;
        *)
            log_error "알 수 없는 옵션: $1"
            echo "도움말을 보려면 $0 --help를 실행하세요."
            exit 1
            ;;
    esac
done

# 스크립트 실행
main "$@"