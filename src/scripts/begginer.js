// NEO Regex Beginner - 초보자 가이드 및 학습 도구 (자동 진행 버전)

class RegexBeginner {
    constructor() {
        this.currentLesson = 1;
        this.totalLessons = 7;
        this.completedLessons = this.loadProgress();
        this.progress = 0;
        this.practiceTimeout = null; // 연습 입력 지연용
        
        this.init();
    }

    init() {
        console.log('🎓 Initializing NEO Regex Beginner Guide...');
        
        this.bindElements();
        this.bindEvents();
        this.showCurrentLesson();
        this.updateProgress();
        this.updateTOC();
        this.updateNavigation();
        this.updateQuickNav();
        
        // 모든 연습 필드에 실시간 이벤트 바인딩
        this.bindAllPracticeFields();
        
        // 초기 다음 버튼 상태 설정
        this.initializeNextButtons();
        
        console.log('✅ NEO Regex Beginner Guide initialized successfully!');
    }

    bindElements() {
        // 기존 레슨 아티클들
        this.lessonArticles = document.querySelectorAll('.lesson');
        
        // Progress elements
        this.progressFill = document.getElementById('lesson-progress');
        this.currentLessonEl = document.getElementById('current-lesson');
        this.totalLessonsEl = document.getElementById('total-lessons');
        
        // Table of contents
        this.tocItems = document.querySelectorAll('.toc-item');
        this.tocCard = document.querySelector('.toc-card');
        
        // Quick navigation
        this.prevQuickBtn = document.getElementById('prev-quick');
        this.nextQuickBtn = document.getElementById('next-quick');
        this.currentIndicator = document.getElementById('current-indicator');
        
        // 모든 레슨 네비게이션 버튼들
        this.nextButtons = document.querySelectorAll('.next-lesson');
        this.prevButtons = document.querySelectorAll('.prev-lesson');
    }

    bindEvents() {
        // Quick navigation events
        this.prevQuickBtn?.addEventListener('click', () => this.goToPreviousLesson());
        this.nextQuickBtn?.addEventListener('click', () => this.goToNextLesson());
        
        // 모든 다음 레슨 버튼들에 이벤트 바인딩
        this.nextButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const nextLesson = parseInt(button.getAttribute('data-next'));
                if (nextLesson && nextLesson <= this.totalLessons && !button.disabled) {
                    this.goToLesson(nextLesson);
                }
            });
        });
        
        // 모든 이전 레슨 버튼들에 이벤트 바인딩
        this.prevButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const prevLesson = parseInt(button.getAttribute('data-prev'));
                if (prevLesson && prevLesson >= 1) {
                    this.goToLesson(prevLesson);
                }
            });
        });
        
        // Table of contents
        this.tocItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lessonNumber = parseInt(item.getAttribute('data-lesson'));
                this.goToLesson(lessonNumber);
            });
        });
        
        // 키보드 단축키
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // 초기 다음 버튼 상태 설정
    initializeNextButtons() {
        this.nextButtons.forEach((button) => {
            const lessonNumber = this.getCurrentLessonNumber(button);
            if (lessonNumber) {
                // 이미 완료된 레슨이면 버튼 활성화
                if (this.completedLessons.includes(lessonNumber)) {
                    button.disabled = false;
                    button.classList.remove('auto-enabled');
                } else {
                    button.disabled = true;
                }
            }
        });
    }

    getCurrentLessonNumber(button) {
        const lessonArticle = button.closest('.lesson');
        if (lessonArticle) {
            const lessonId = lessonArticle.id;
            const match = lessonId.match(/lesson-(\d+)/);
            return match ? parseInt(match[1]) : null;
        }
        return null;
    }

    // 모든 연습 필드에 실시간 이벤트 바인딩
    bindAllPracticeFields() {
        console.log('🔗 Binding practice fields...');
        
        // 기존 practice-field 클래스가 있는 모든 요소
        document.querySelectorAll('.practice-field').forEach(field => {
            const lessonNum = field.getAttribute('data-lesson');
            
            // 실시간 입력 이벤트
            field.addEventListener('input', (e) => {
                // 기존 타이머 클리어
                if (this.practiceTimeout) {
                    clearTimeout(this.practiceTimeout);
                }
                
                // 즉시 결과 업데이트
                this.updatePracticeResult(e.target.value, lessonNum);
                
                // 1초 후 레슨 완료 체크
                this.practiceTimeout = setTimeout(() => {
                    if (e.target.value.trim()) {
                        this.autoCompleteLesson(parseInt(lessonNum));
                    }
                }, 1000);
            });
            
            // 초기 실행 (페이지 로드시)
            this.updatePracticeResult(field.value, lessonNum);
            
            console.log(`✅ Bound practice field for lesson ${lessonNum}`);
        });
    }

    // 연습 결과 실시간 업데이트
    updatePracticeResult(pattern, lessonNum) {
        const resultElement = document.getElementById(`practice-result-${lessonNum}`);
        const textElement = document.getElementById(`practice-text-${lessonNum}`);
        
        if (!resultElement || !textElement) return;

        const testTexts = {
            '2': 'I have a dog and a cat. My dog is very friendly. The cat likes to sleep.',
            '4': 'Hello World! Programming is fun.',
            '5': '전화번호: 010-1234-5678, 우편번호: 12345',
            '6': 'Hello World\nSay Hello\nHello there!\nWell Hello',
            '7': 'user@example.com\ninvalid-email\ntest@domain.co.kr\n@incomplete.com'
        };
        
        const testText = testTexts[lessonNum] || 'Test text';
        
        if (!pattern.trim()) {
            resultElement.innerHTML = `
                <div class="demo-info">
                    <i class="fas fa-info-circle"></i>
                    패턴을 입력해보세요!
                </div>
            `;
            textElement.innerHTML = testText.replace(/\n/g, '<br>');
            return;
        }

        try {
            const regex = new RegExp(pattern, 'gi');
            let highlightedText = testText;
            
            // 줄바꿈을 임시로 특수 문자로 변경
            const tempNewline = '___NEWLINE___';
            highlightedText = highlightedText.replace(/\n/g, tempNewline);
            
            const matches = [...highlightedText.matchAll(regex)];

            if (matches.length > 0) {
                let offset = 0;

                matches.forEach(match => {
                    const start = match.index + offset;
                    const end = start + match[0].length;
                    const matchText = highlightedText.slice(start, end);
                    
                    const highlighted = `<mark style="background-color: #10b981; color: white; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${matchText}</mark>`;
                    
                    highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
                    offset += highlighted.length - matchText.length;
                });

                // 임시 줄바꿈을 다시 HTML로 변경
                highlightedText = highlightedText.replace(new RegExp(tempNewline, 'g'), '<br>');
                textElement.innerHTML = highlightedText;
                
                resultElement.innerHTML = `
                    <div class="demo-success">
                        <i class="fas fa-check-circle"></i>
                        ${matches.length}개의 매칭을 찾았습니다!
                    </div>
                `;
            } else {
                textElement.innerHTML = testText.replace(/\n/g, '<br>');
                resultElement.innerHTML = `
                    <div class="demo-info">
                        <i class="fas fa-info-circle"></i>
                        매칭되는 항목이 없습니다.
                    </div>
                `;
            }
        } catch (error) {
            textElement.innerHTML = testText.replace(/\n/g, '<br>');
            resultElement.innerHTML = `
                <div class="demo-error">
                    <i class="fas fa-exclamation-circle"></i>
                    오류: ${error.message}
                </div>
            `;
        }
    }

    // 자동 레슨 완료 처리
    autoCompleteLesson(lessonNumber) {
        if (!this.completedLessons.includes(lessonNumber)) {
            this.completedLessons.push(lessonNumber);
            this.saveProgress();
            this.updateProgress();
            this.updateTOC();
            this.updateTOCCardBorder();
            
            // 해당 레슨의 다음 버튼 활성화
            this.enableNextButton(lessonNumber);
            
            console.log(`🎉 Lesson ${lessonNumber} auto-completed!`);
            
            // 3초 후 자동으로 다음 레슨으로 이동
            setTimeout(() => {
                if (lessonNumber < this.totalLessons) {
                    this.goToLesson(lessonNumber + 1);
                }
            }, 3000);
        }
    }

    // 다음 버튼 활성화
    enableNextButton(lessonNumber) {
        this.nextButtons.forEach((button) => {
            const currentLessonNum = this.getCurrentLessonNumber(button);
            if (currentLessonNum === lessonNumber) {
                button.disabled = false;
                button.classList.add('auto-enabled');
                
                // 버튼 활성화 애니메이션 후 클래스 제거
                setTimeout(() => {
                    button.classList.remove('auto-enabled');
                }, 500);
            }
        });
    }

    // TOC 카드 테두리 업데이트
    updateTOCCardBorder() {
        if (this.tocCard && this.completedLessons.length > 0) {
            this.tocCard.classList.add('has-completed');
        }
    }

    // 레슨 이동
    goToLesson(lessonNumber) {
        if (lessonNumber < 1 || lessonNumber > this.totalLessons) return;
        
        this.currentLesson = lessonNumber;
        this.showCurrentLesson();
        this.updateNavigation();
        this.updateQuickNav();
        this.updateTOC();
        
        // 새 레슨의 연습 필드 바인딩
        setTimeout(() => {
            this.bindAllPracticeFields();
            this.initializeNextButtons();
        }, 100);
    }

    goToNextLesson() {
        if (this.currentLesson < this.totalLessons) {
            this.goToLesson(this.currentLesson + 1);
        }
    }

    goToPreviousLesson() {
        if (this.currentLesson > 1) {
            this.goToLesson(this.currentLesson - 1);
        }
    }

    showCurrentLesson() {
        if (this.lessonArticles.length > 0) {
            this.lessonArticles.forEach((lesson, index) => {
                const lessonNumber = index + 1;
                if (lessonNumber === this.currentLesson) {
                    lesson.style.display = 'block';
                    lesson.classList.add('active');
                } else {
                    lesson.style.display = 'none';
                    lesson.classList.remove('active');
                }
            });
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgress() {
        const completedCount = this.completedLessons.length;
        const progressPercentage = (completedCount / this.totalLessons) * 100;
        
        if (this.progressFill) {
            this.progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (this.currentLessonEl) {
            this.currentLessonEl.textContent = completedCount.toString();
        }
        
        if (this.totalLessonsEl) {
            this.totalLessonsEl.textContent = this.totalLessons.toString();
        }
        
        this.progress = progressPercentage;
    }

    updateTOC() {
        this.tocItems.forEach((item) => {
            const lessonNumber = parseInt(item.getAttribute('data-lesson'));
            
            // Remove all states
            item.classList.remove('active', 'completed');
            
            // Add appropriate state
            if (lessonNumber === this.currentLesson) {
                item.classList.add('active');
            } else if (this.completedLessons.includes(lessonNumber)) {
                item.classList.add('completed');
            }
        });
        
        // TOC 카드 테두리 업데이트
        this.updateTOCCardBorder();
    }

    updateNavigation() {
        if (this.prevQuickBtn) {
            this.prevQuickBtn.disabled = this.currentLesson === 1;
            this.prevQuickBtn.style.opacity = this.currentLesson === 1 ? '0.5' : '1';
        }
        
        if (this.nextQuickBtn) {
            this.nextQuickBtn.disabled = this.currentLesson === this.totalLessons;
            this.nextQuickBtn.style.opacity = this.currentLesson === this.totalLessons ? '0.5' : '1';
        }
    }

    updateQuickNav() {
        if (this.currentIndicator) {
            this.currentIndicator.textContent = this.currentLesson.toString();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 스타일 적용
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                       type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                       'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // 애니메이션
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 자동 제거
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // 키보드 단축키 처리
    handleKeyboardShortcuts(e) {
        // Arrow keys for navigation
        if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            this.goToPreviousLesson();
        } else if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            this.goToNextLesson();
        }
        
        // 숫자 키로 직접 레슨 이동 (1-7)
        if (e.key >= '1' && e.key <= '7' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            const lessonNum = parseInt(e.key);
            this.goToLesson(lessonNum);
        }
    }

    // 진행 상황 저장/로드
    saveProgress() {
        localStorage.setItem('regexBeginner_progress', JSON.stringify(this.completedLessons));
    }

    loadProgress() {
        const saved = localStorage.getItem('regexBeginner_progress');
        return saved ? JSON.parse(saved) : [];
    }

    // 디버깅 도구
    debug() {
        console.log('=== Beginner Tool Debug Info ===');
        console.log('Current lesson:', this.currentLesson);
        console.log('Total lessons:', this.totalLessons);
        console.log('Completed lessons:', this.completedLessons);
        console.log('Progress:', `${this.progress.toFixed(1)}%`);
        console.log('Elements found:');
        console.log('- Progress fill:', !!this.progressFill);
        console.log('- TOC items:', this.tocItems.length);
        console.log('- Lesson articles:', this.lessonArticles.length);
        console.log('=================================');
    }
}

// 전역 함수들
window.debugBeginner = function() {
    if (window.beginnerTool) {
        window.beginnerTool.debug();
    } else {
        console.log('Beginner tool not initialized yet');
    }
};

window.forceLoadLesson = function(n) {
    if (window.beginnerTool) {
        window.beginnerTool.goToLesson(n);
    } else {
        console.log('Beginner tool not initialized yet');
    }
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.beginnerTool = new RegexBeginner();
        
        // 1초 후 자동 디버깅
        setTimeout(() => {
            console.log('🔍 Auto-debugging beginner tool...');
            window.debugBeginner();
        }, 1000);
        
    } catch (error) {
        console.error('Failed to initialize RegexBeginner:', error);
        
        // 사용자에게 오류 알림
        setTimeout(() => {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="position: fixed; top: 20px; left: 20px; right: 20px; background: #fee; color: #c53030; padding: 20px; border-radius: 8px; border: 1px solid #fed7d7; z-index: 10000;">
                    <strong>⚠️ 초기화 오류</strong><br>
                    페이지를 새로고침해주세요. 문제가 계속되면 개발자 도구의 콘솔을 확인해주세요.
                    <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 10px; background: #c53030; color: white; border: none; border-radius: 4px; cursor: pointer;">새로고침</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        }, 1000);
    }
});