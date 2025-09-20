#!/bin/bash
# scripts/deploy.sh
# NEO Regex 프로젝트 배포 스크립트

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

# 배포 환경 설정
DEPLOY_ENV=${DEPLOY_ENV:-production}
DEPLOY_TARGET=${DEPLOY_TARGET:-all}

echo "=================================================="
echo "🚀 NEO Regex 배포 시작"
echo "=================================================="

log_info "배포 환경: $DEPLOY_ENV"
log_info "배포 대상: $DEPLOY_TARGET"

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

# 환경별 설정
case $DEPLOY_ENV in
    "staging")
        log_info "스테이징 환경 배포를 준비합니다..."
        ;;
    "production")
        log_info "프로덕션 환경 배포를 준비합니다..."
        ;;
    *)
        log_error "지원하지 않는 배포 환경입니다: $DEPLOY_ENV"
        exit 1
        ;;
esac

# 사전 체크
pre_deploy_check() {
    log_step "배포 전 체크 실행 중..."
    
    # Git 상태 확인
    if [ -d ".git" ]; then
        # 커밋되지 않은 변경사항 확인
        if ! git diff-index --quiet HEAD --; then
            log_warning "커밋되지 않은 변경사항이 있습니다."
            
            if [ "$DEPLOY_ENV" = "production" ]; then
                log_error "프로덕션 배포는 커밋된 상태에서만 가능합니다."
                exit 1
            fi
        fi
        
        # 현재 브랜치 확인
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        log_info "현재 브랜치: $CURRENT_BRANCH"
        
        if [ "$DEPLOY_ENV" = "production" ] && [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
            log_warning "프로덕션 배포는 main/master 브랜치에서 권장됩니다."
            read -p "계속하시겠습니까? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "배포가 취소되었습니다."
                exit 0
            fi
        fi
        
        # 최신 커밋 정보
        COMMIT_HASH=$(git rev-parse --short HEAD)
        COMMIT_MESSAGE=$(git log -1 --pretty=%B | head -n 1)
        log_info "배포할 커밋: $COMMIT_HASH - $COMMIT_MESSAGE"
    fi
    
    # 환경 변수 확인
    if [ ! -f ".env" ] && [ "$DEPLOY_ENV" = "production" ]; then
        log_warning ".env 파일이 없습니다. 환경 변수가 올바르게 설정되어 있는지 확인하세요."
    fi
    
    # 필수 도구 확인
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다."
        exit 1
    fi
    
    log_success "배포 전 체크 완료"
}

# 백업 생성
create_backup() {
    if [ "$DEPLOY_ENV" = "production" ]; then
        log_step "기존 배포 백업 생성 중..."
        
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # 프론트엔드 백업
        if [ -d "frontend/dist" ]; then
            cp -r "frontend/dist" "$BACKUP_DIR/frontend-dist"
            log_info "프론트엔드 백업 완료"
        fi
        
        # 백엔드 백업 (설정 파일들)
        if [ -d "backend" ]; then
            mkdir -p "$BACKUP_DIR/backend"
            cp -r backend/config "$BACKUP_DIR/backend/" 2>/dev/null || true
            log_info "백엔드 설정 백업 완료"
        fi
        
        log_success "백업 생성 완료: $BACKUP_DIR"
    fi
}

# 빌드 실행
run_build() {
    log_step "프로덕션 빌드 실행 중..."
    
    # 환경 변수 설정
    export NODE_ENV=production
    export BUILD_TARGET=$DEPLOY_TARGET
    
    # 빌드 스크립트 실행
    if [ -f "scripts/build.sh" ]; then
        chmod +x scripts/build.sh
        ./scripts/build.sh
    else
        log_error "빌드 스크립트를 찾을 수 없습니다."
        exit 1
    fi
    
    log_success "빌드 완료"
}

# 데이터베이스 마이그레이션
run_migrations() {
    if [ "$DEPLOY_TARGET" = "all" ] || [ "$DEPLOY_TARGET" = "backend" ]; then
        log_step "데이터베이스 마이그레이션 실행 중..."
        
        cd backend
        
        # 마이그레이션 스크립트가 있는지 확인
        if npm run migrate:check > /dev/null 2>&1; then
            npm run migrate
            log_success "마이그레이션 완료"
        else
            log_info "마이그레이션 스크립트가 없습니다."
        fi
        
        cd ..
    fi
}

# 헬스 체크
health_check() {
    local max_attempts=30
    local attempt=1
    
    log_step "서비스 헬스 체크 중..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3001/health > /dev/null; then
            log_success "서비스가 정상 작동 중입니다."
            return 0
        fi
        
        log_info "시도 $attempt/$max_attempts - 서비스 응답 대기 중..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "서비스 헬스 체크 실패"
    return 1
}

# 정적 파일 배포 (CDN/S3 등)
deploy_static_files() {
    if [ "$DEPLOY_TARGET" = "all" ] || [ "$DEPLOY_TARGET" = "frontend" ]; then
        log_step "정적 파일 배포 중..."
        
        # AWS S3 배포 (예시)
        if [ -n "$AWS_S3_BUCKET" ] && command -v aws &> /dev/null; then
            log_info "AWS S3에 정적 파일 업로드 중..."
            
            aws s3 sync frontend/dist/ s3://$AWS_S3_BUCKET/ \
                --delete \
                --cache-control "public, max-age=31536000" \
                --exclude "*.html" \
                --exclude "service-worker.js"
            
            # HTML 파일은 짧은 캐시 시간
            aws s3 sync frontend/dist/ s3://$AWS_S3_BUCKET/ \
                --include "*.html" \
                --include "service-worker.js" \
                --cache-control "public, max-age=300"
            
            log_success "S3 업로드 완료"
            
            # CloudFront 무효화
            if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
                log_info "CloudFront 캐시 무효화 중..."
                aws cloudfront create-invalidation \
                    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
                    --paths "/*"
                log_success "CloudFront 무효화 완료"
            fi
        fi
        
        # Vercel 배포 (예시)
        if [ -n "$VERCEL_TOKEN" ] && command -v vercel &> /dev/null; then
            log_info "Vercel에 배포 중..."
            cd frontend
            vercel --prod --token $VERCEL_TOKEN
            cd ..
            log_success "Vercel 배포 완료"
        fi
        
        # Netlify 배포 (예시)
        if [ -n "$NETLIFY_SITE_ID" ] && command -v netlify &> /dev/null; then
            log_info "Netlify에 배포 중..."
            cd frontend
            netlify deploy --prod --dir dist --site $NETLIFY_SITE_ID
            cd ..
            log_success "Netlify 배포 완료"
        fi
    fi
}

# 서버 배포
deploy_server() {
    if [ "$DEPLOY_TARGET" = "all" ] || [ "$DEPLOY_TARGET" = "backend" ]; then
        log_step "서버 배포 중..."
        
        # PM2 배포 (예시)
        if command -v pm2 &> /dev/null; then
            log_info "PM2로 서버 재시작 중..."
            
            cd backend
            
            # PM2 설정 파일이 있는지 확인
            if [ -f "ecosystem.config.js" ]; then
                pm2 startOrRestart ecosystem.config.js --env $DEPLOY_ENV
            else
                pm2 startOrRestart src/server.js --name neo-regex-api
            fi
            
            cd ..
            log_success "PM2 서버 재시작 완료"
        fi
        
        # Docker 배포 (예시)
        if [ -f "Dockerfile" ] && command -v docker &> /dev/null; then
            log_info "Docker 컨테이너 배포 중..."
            
            # 이미지 빌드
            docker build -t neo-regex:latest .
            
            # 기존 컨테이너 중지 및 제거
            docker stop neo-regex || true
            docker rm neo-regex || true
            
            # 새 컨테이너 실행
            docker run -d \
                --name neo-regex \
                -p 3000:3000 \
                --env-file .env \
                neo-regex:latest
            
            log_success "Docker 배포 완료"
        fi
        
        # Railway 배포 (예시)
        if [ -n "$RAILWAY_TOKEN" ] && command -v railway &> /dev/null; then
            log_info "Railway에 배포 중..."
            railway up
            log_success "Railway 배포 완료"
        fi
    fi
}

# 배포 후 검증
post_deploy_verification() {
    log_step "배포 후 검증 실행 중..."
    
    # 서비스 헬스 체크
    if ! health_check; then
        log_error "헬스 체크 실패"
        return 1
    fi
    
    # 기본 기능 테스트
    log_info "기본 기능 테스트 중..."
    
    # API 엔드포인트 테스트
    if curl -f -s http://localhost:3001/api/regex/test \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"pattern": "\\d+", "text": "123"}' > /dev/null; then
        log_success "API 기능 테스트 통과"
    else
        log_warning "API 기능 테스트 실패"
    fi
    
    # 프론트엔드 테스트 (정적 파일이 제공되는지)
    if curl -f -s http://localhost:3001/ > /dev/null; then
        log_success "프론트엔드 접근 테스트 통과"
    else
        log_warning "프론트엔드 접근 테스트 실패"
    fi
    
    log_success "배포 후 검증 완료"
}

# 배포 알림
send_notification() {
    local status=$1
    local message=$2
    
    # Slack 알림 (예시)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 NEO Regex 배포 $status: $message\"}" \
            $SLACK_WEBHOOK_URL
    fi
    
    # Discord 알림 (예시)
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"🚀 NEO Regex 배포 $status: $message\"}" \
            $DISCORD_WEBHOOK_URL
    fi
}

# 롤백 함수
rollback() {
    log_warning "배포 실패로 인한 롤백을 시작합니다..."
    
    # 가장 최근 백업 찾기
    LATEST_BACKUP=$(ls -1 backups/ | tail -n 1)
    
    if [ -n "$LATEST_BACKUP" ] && [ -d "backups/$LATEST_BACKUP" ]; then
        log_info "백업을 복원합니다: $LATEST_BACKUP"
        
        # 프론트엔드 롤백
        if [ -d "backups/$LATEST_BACKUP/frontend-dist" ]; then
            rm -rf frontend/dist
            cp -r "backups/$LATEST_BACKUP/frontend-dist" frontend/dist
            log_info "프론트엔드 롤백 완료"
        fi
        
        # 서버 재시작
        if command -v pm2 &> /dev/null; then
            pm2 restart neo-regex-api
        fi
        
        log_success "롤백 완료"
        send_notification "실패 (롤백됨)" "배포 실패로 인해 이전 버전으로 롤백되었습니다."
    else
        log_error "롤백할 백업을 찾을 수 없습니다."
    fi
}

# 메인 배포 함수
main() {
    local start_time=$(date +%s)
    
    # 에러 발생 시 롤백
    trap rollback ERR
    
    # 배포 단계별 실행
    pre_deploy_check
    create_backup
    run_build
    run_migrations
    deploy_static_files
    deploy_server
    post_deploy_verification
    
    # 배포 완료
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "=================================================="
    log_success "🎉 배포가 성공적으로 완료되었습니다!"
    echo "=================================================="
    
    log_info "📊 배포 요약:"
    log_info "  - 환경: $DEPLOY_ENV"
    log_info "  - 대상: $DEPLOY_TARGET"
    log_info "  - 소요 시간: ${duration}초"
    log_info "  - 커밋: $COMMIT_HASH"
    
    # 성공 알림
    send_notification "성공" "배포가 성공적으로 완료되었습니다. (${duration}초 소요)"
    
    # 배포 후 안내
    echo ""
    log_info "🌐 서비스 URL:"
    if [ "$DEPLOY_ENV" = "production" ]; then
        log_info "  - 프로덕션: https://neoregex.com"
    else
        log_info "  - 스테이징: https://staging.neoregex.com"
    fi
    log_info "  - API: http://localhost:3001/health"
    
    # 트랩 해제 (성공적으로 완료됨)
    trap - ERR
}

# 스크립트 실행
main "$@"