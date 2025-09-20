#!/bin/bash
# scripts/build.sh
# NEO Regex 프로젝트 빌드 스크립트

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}🔄 $1${NC}"
}

# 빌드 시작
echo "=================================================="
echo "🚀 NEO Regex 프로젝트 빌드 시작"
echo "=================================================="

# 환경 변수 설정
NODE_ENV=${NODE_ENV:-production}
BUILD_TARGET=${BUILD_TARGET:-all}

log_info "빌드 환경: $NODE_ENV"
log_info "빌드 대상: $BUILD_TARGET"

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")/.."

# Node.js 버전 확인
log_step "Node.js 버전 확인 중..."
NODE_VERSION=$(node --version)
log_info "Node.js 버전: $NODE_VERSION"

# 최소 요구 버전 확인 (Node.js 18 이상)
REQUIRED_NODE_MAJOR=18
CURRENT_NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)

if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
    log_error "Node.js $REQUIRED_NODE_MAJOR 이상이 필요합니다. 현재 버전: $NODE_VERSION"
    exit 1
fi

log_success "Node.js 버전 확인 완료"

# 의존성 설치 함수
install_dependencies() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ]; then
        log_step "$name 의존성 설치 중..."
        cd "$dir"
        
        # package-lock.json이 있으면 npm ci, 없으면 npm install
        if [ -f "package-lock.json" ]; then
            npm ci --silent
        else
            npm install --silent
        fi
        
        log_success "$name 의존성 설치 완료"
        cd ..
    else
        log_warning "$dir/package.json을 찾을 수 없습니다."
    fi
}

# 린팅 함수
run_linting() {
    local dir=$1
    local name=$2
    
    log_step "$name ESLint 검사 중..."
    cd "$dir"
    
    if npm run lint > /dev/null 2>&1; then
        log_success "$name 린팅 통과"
    else
        log_warning "$name 린팅에서 경고가 발견되었습니다."
        npm run lint || true
    fi
    
    cd ..
}

# 테스트 실행 함수
run_tests() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ] && grep -q '"test"' "$dir/package.json"; then
        log_step "$name 테스트 실행 중..."
        cd "$dir"
        
        if npm test; then
            log_success "$name 테스트 통과"
        else
            log_error "$name 테스트 실패"
            exit 1
        fi
        
        cd ..
    else
        log_info "$name 테스트 스크립트가 없습니다."
    fi
}

# 빌드 함수
build_project() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ] && grep -q '"build"' "$dir/package.json"; then
        log_step "$name 빌드 중..."
        cd "$dir"
        
        # 기존 빌드 결과물 정리
        if [ -d "dist" ]; then
            rm -rf dist
            log_info "기존 빌드 결과물 정리 완료"
        fi
        
        # 빌드 실행
        if npm run build; then
            log_success "$name 빌드 완료"
            
            # 빌드 결과물 확인
            if [ -d "dist" ]; then
                DIST_SIZE=$(du -sh dist | cut -f1)
                log_info "빌드 결과물 크기: $DIST_SIZE"
                
                # 빌드 결과물 파일 개수
                FILE_COUNT=$(find dist -type f | wc -l)
                log_info "빌드 파일 개수: $FILE_COUNT개"
            fi
        else
            log_error "$name 빌드 실패"
            exit 1
        fi
        
        cd ..
    else
        log_info "$name 빌드 스크립트가 없습니다."
    fi
}

# 프로덕션 최적화
optimize_build() {
    local dir=$1
    
    if [ -d "$dir/dist" ]; then
        log_step "빌드 최적화 중..."
        cd "$dir"
        
        # Gzip 압축률 확인
        if command -v gzip >/dev/null 2>&1; then
            log_info "Gzip 압축률 확인 중..."
            find dist -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
                original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
                gzip_size=$(gzip -c "$file" | wc -c)
                compression_ratio=$(echo "scale=1; (1 - $gzip_size/$original_size) * 100" | bc 2>/dev/null || echo "N/A")
                
                if [ "$compression_ratio" != "N/A" ]; then
                    log_info "$(basename "$file"): ${compression_ratio}% 압축"
                fi
            done
        fi
        
        cd ..
    fi
}

# 빌드 정보 생성
generate_build_info() {
    log_step "빌드 정보 생성 중..."
    
    BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    BUILD_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    
    # 빌드 정보 JSON 생성
    cat > build-info.json << EOF
{
  "buildTime": "$BUILD_TIME",
  "gitHash": "$BUILD_HASH",
  "gitBranch": "$BUILD_BRANCH",
  "nodeVersion": "$NODE_VERSION",
  "environment": "$NODE_ENV",
  "version": "$(node -p "require('./package.json').version")"
}
EOF
    
    log_success "빌드 정보 생성 완료 (build-info.json)"
}

# 메인 빌드 프로세스
main() {
    # 루트 의존성 설치
    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "root" ]; then
        install_dependencies "." "루트"
    fi
    
    # 백엔드 빌드
    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "backend" ]; then
        if [ -d "backend" ]; then
            install_dependencies "backend" "백엔드"
            run_linting "backend" "백엔드"
            run_tests "backend" "백엔드"
        fi
    fi
    
    # 프론트엔드 빌드
    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "frontend" ]; then
        if [ -d "frontend" ]; then
            install_dependencies "frontend" "프론트엔드"
            run_linting "frontend" "프론트엔드"
            run_tests "frontend" "프론트엔드"
            build_project "frontend" "프론트엔드"
            
            # 프로덕션 환경일 때만 최적화
            if [ "$NODE_ENV" = "production" ]; then
                optimize_build "frontend"
            fi
        fi
    fi
    
    # 빌드 정보 생성
    generate_build_info
    
    # 빌드 완료 메시지
    echo ""
    echo "=================================================="
    log_success "🎉 빌드가 성공적으로 완료되었습니다!"
    echo "=================================================="
    
    # 빌드 요약
    echo ""
    log_info "📊 빌드 요약:"
    log_info "  - 환경: $NODE_ENV"
    log_info "  - 대상: $BUILD_TARGET"
    log_info "  - Git 해시: $BUILD_HASH"
    log_info "  - 빌드 시간: $BUILD_TIME"
    
    if [ -d "frontend/dist" ]; then
        FRONTEND_SIZE=$(du -sh frontend/dist | cut -f1)
        log_info "  - 프론트엔드 빌드 크기: $FRONTEND_SIZE"
    fi
    
    echo ""
    log_info "🚀 다음 단계:"
    log_info "  - 개발 서버 실행: npm run dev"
    log_info "  - 프로덕션 서버 실행: npm start"
    log_info "  - 배포: npm run deploy"
}

# 에러 핸들링
trap 'log_error "빌드 중 오류가 발생했습니다."; exit 1' ERR

# 메인 함수 실행
main "$@"