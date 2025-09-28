// NEO Regex Beginner - 초보자 가이드 및 학습 도구 (완전 수정 버전)

class RegexBeginner {
    constructor() {
        this.currentLesson = 1;
        this.totalLessons = 7; // HTML에 있는 실제 레슨 수
        this.completedLessons = new Set(); // 새로고침시 초기화되도록 localStorage 제거
        this.progress = 0;
        this.interactiveMode = true;
        
        this.init();
    }

    init() {
        console.log('🎓 Initializing NEO Regex Beginner Guide...');
        
        // 새로고침 경고 이벤트 추가
        this.addRefreshWarning();
        
        this.bindElements();
        this.bindEvents();
        this.showCurrentLesson();
        this.updateProgress();
        this.updateTOC();
        this.updateNavigation();
        this.updateQuickNav();
        
        // 모든 연습 필드에 실시간 이벤트 바인딩
        this.bindAllPracticeFields();
        
        // 1번 레슨 버튼 처음부터 활성화 및 모든 버튼 상태 초기화
        this.initializeFirstLessonButton();
        this.resetAllNextButtons();
        
        console.log('✅ NEO Regex Beginner Guide initialized successfully!');
    }

    // 새로고침 경고 추가
    addRefreshWarning() {
        window.addEventListener('beforeunload', (e) => {
            if (this.completedLessons.size > 0) {
                const message = '페이지를 새로고침하면 진행 상황이 초기화됩니다. 계속하시겠습니까?';
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
    }

    // 1번 레슨 버튼 처음부터 활성화
    initializeFirstLessonButton() {
        const lesson1NextButton = document.querySelector('#lesson-1 .next-lesson');
        if (lesson1NextButton) {
            lesson1NextButton.disabled = false;
            lesson1NextButton.classList.remove('disabled');
            console.log('✅ Lesson 1 next button activated by default');
        }
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
                if (nextLesson && nextLesson <= this.totalLessons) {
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

    // 모든 연습 필드에 실시간 이벤트 바인딩
    bindAllPracticeFields() {
        const practiceFields = document.querySelectorAll('.practice-field');
        
        practiceFields.forEach(field => {
            const lessonNumber = parseInt(field.getAttribute('data-lesson'));
            
            // 해당 레슨의 원본 텍스트 미리 저장
            this.getOriginalText(lessonNumber);
            
            // 실시간 입력 이벤트
            field.addEventListener('input', (e) => {
                this.handlePracticeInput(e.target.value, lessonNumber);
            });
            
            // 키보드 이벤트 (엔터키)
            field.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handlePracticeInput(e.target.value, lessonNumber);
                }
            });
        });
        
        console.log('✅ Practice fields bound and original texts saved');
    }

    // 연습 입력 처리
    handlePracticeInput(pattern, lessonNumber) {
        try {
            const textElement = document.getElementById(`practice-text-${lessonNumber}`);
            const resultElement = document.getElementById(`practice-result-${lessonNumber}`);
            
            if (!textElement || !resultElement) return;
            
            // HTML에서 원본 텍스트 가져오기 (첫 번째 호출시 저장됨)
            const originalText = this.getOriginalText(lessonNumber);
            
            // 패턴이 실제로 의미있는 내용인지 체크 (공백만 있거나 비어있으면 안됨)
            if (pattern && pattern.trim()) {
                const regex = new RegExp(pattern, 'gi');
                
                // 매칭 결과 하이라이트 (원본 텍스트 기준으로)
                const highlightedText = this.highlightMatches(originalText, regex);
                textElement.innerHTML = highlightedText;
                
                // 결과 설명 업데이트
                const matches = originalText.match(regex);
                const matchCount = matches ? matches.length : 0;
                
                // 패턴이 의미있고 실제로 매칭되는 경우만 완료 처리
                if (matchCount > 0 && pattern.trim().length > 0) {
                    // 매칭 성공시 바로 레슨 완료 처리
                    this.completeLesson(lessonNumber);
                    
                    resultElement.innerHTML = `
                        <div class="demo-explanation success">
                            <strong>✅ ${matchCount}개 매칭됨:</strong> ${matches.join(', ')}
                            <br><span style="color: #10b981; font-weight: 600; margin-top: 8px; display: inline-block;">
                                <i class="fas fa-check-circle"></i> 레슨 완료! 다음 버튼이 활성화되었습니다.
                            </span>
                        </div>
                    `;
                } else {
                    resultElement.innerHTML = `
                        <div class="demo-explanation warning">
                            <strong>❌ 매칭되지 않음</strong> - 다른 패턴을 시도해보세요!
                        </div>
                    `;
                }
            } else {
                // 패턴이 비어있으면 원본 텍스트로 복원 (하이라이트 제거)
                textElement.innerHTML = originalText;
                resultElement.innerHTML = `
                    <div class="demo-explanation">
                        <strong>설명:</strong> 정규식 패턴을 입력해보세요!
                    </div>
                `;
            }
        } catch (error) {
            // 잘못된 정규식 패턴 - 원본 텍스트 유지
            const textElement = document.getElementById(`practice-text-${lessonNumber}`);
            const resultElement = document.getElementById(`practice-result-${lessonNumber}`);
            
            if (textElement) {
                const originalText = this.getOriginalText(lessonNumber);
                textElement.innerHTML = originalText;
            }
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="demo-explanation error">
                        <strong>❌ 잘못된 패턴</strong> - 정규식 문법을 확인해보세요!
                    </div>
                `;
            }
        }
    }

    // 원본 텍스트 반환 (HTML에서 실제 텍스트 가져오기)
    getOriginalText(lessonNumber) {
        const textElement = document.getElementById(`practice-text-${lessonNumber}`);
        if (textElement) {
            // 원본 텍스트가 저장되어 있지 않다면 현재 텍스트를 원본으로 저장
            if (!textElement.dataset.originalText) {
                // HTML 태그를 제거하고 순수한 텍스트만 저장
                const textContent = textElement.textContent || textElement.innerText;
                textElement.dataset.originalText = textContent;
                console.log(`📝 Original text saved for lesson ${lessonNumber}:`, textContent);
            }
            return textElement.dataset.originalText;
        }
        
        // 백업용 텍스트 (HTML 요소가 없는 경우)
        const fallbackTexts = {
            2: 'Hello, my name is John. Hello World! Say Hello to everyone.',
            3: 'I have a cat and a cut apple. The cat.exe file is here.',
            4: 'Programming is fun.',
            5: '전화번호: 010-1234-5678, 우편번호: 12345',
            6: 'Hello World\nSay Hello\nHello there!\nWell Hello',
            7: 'Email: user@example.com, Website: https://regex.com'
        };
        
        console.log(`⚠️ Using fallback text for lesson ${lessonNumber}`);
        return fallbackTexts[lessonNumber] || 'Test text here';
    }

    // 매칭 결과 하이라이트
    highlightMatches(text, regex) {
        return text.replace(regex, '<mark>$&</mark>');
    }

    // 레슨 완료 처리
    completeLesson(lessonNumber) {
        if (this.completedLessons.has(lessonNumber)) return;
        
        this.completedLessons.add(lessonNumber);
        console.log(`✅ Lesson ${lessonNumber} completed!`);
        
        // 다음 버튼 활성화 (레슨 1은 이미 활성화되어 있음)
        const currentLessonElement = document.getElementById(`lesson-${lessonNumber}`);
        if (currentLessonElement) {
            const nextButton = currentLessonElement.querySelector('.next-lesson');
            if (nextButton) {
                nextButton.disabled = false;
                nextButton.classList.remove('disabled');
                nextButton.classList.add('activated');
                
                // 활성화 애니메이션만 적용
                nextButton.style.animation = 'buttonActivate 0.5s ease-out';
            }
        }
        
        this.updateProgress();
        this.updateTOC();
        
        console.log(`Lesson ${lessonNumber} completed. Next button is now active!`);
    }

    // 현재 레슨 표시
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
        
        // 모든 레슨의 다음 버튼 상태 초기화
        this.resetAllNextButtons();
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 모든 다음 버튼 상태 초기화
    resetAllNextButtons() {
        this.nextButtons.forEach((button, index) => {
            const buttonLessonNumber = parseInt(button.getAttribute('data-next')) - 1; // 현재 레슨 번호
            
            // 1번 레슨은 항상 활성화
            if (buttonLessonNumber === 1) {
                button.disabled = false;
                button.classList.remove('disabled');
                return;
            }
            
            // 완료된 레슨의 버튼은 활성화, 그렇지 않으면 비활성화
            if (this.completedLessons.has(buttonLessonNumber)) {
                button.disabled = false;
                button.classList.remove('disabled');
                button.classList.add('activated');
            } else {
                button.disabled = true;
                button.classList.add('disabled');
                button.classList.remove('activated');
                button.style.animation = '';
            }
        });
    }

    // 특정 레슨으로 이동
    goToLesson(lessonNumber) {
        if (lessonNumber < 1 || lessonNumber > this.totalLessons) return;
        
        // 1번 레슨에서 나갈 때 완료 처리 (연습이 없으므로)
        if (this.currentLesson === 1 && lessonNumber > 1) {
            this.completedLessons.add(1);
            console.log('✅ Lesson 1 completed (no practice required)');
        }
        
        this.currentLesson = lessonNumber;
        this.showCurrentLesson(); // 이 함수에서 버튼 상태도 초기화됨
        this.updateProgress();
        this.updateTOC();
        this.updateNavigation();
        this.updateQuickNav();
        
        console.log(`📖 Moved to lesson ${lessonNumber}`);
    }

    // 다음 레슨으로 이동
    goToNextLesson() {
        if (this.currentLesson < this.totalLessons) {
            this.goToLesson(this.currentLesson + 1);
        }
    }

    // 이전 레슨으로 이동
    goToPreviousLesson() {
        if (this.currentLesson > 1) {
            this.goToLesson(this.currentLesson - 1);
        }
    }

    // 진행률 업데이트
    updateProgress() {
        const completedCount = this.completedLessons.size;
        this.progress = (completedCount / this.totalLessons) * 100;
        
        if (this.progressFill) {
            this.progressFill.style.width = `${this.progress}%`;
        }
        
        // 실제 완료된 레슨 수를 표시 (현재 페이지 번호가 아님)
        if (this.currentLessonEl) {
            this.currentLessonEl.textContent = completedCount;
        }
        
        if (this.totalLessonsEl) {
            this.totalLessonsEl.textContent = this.totalLessons;
        }
        
        console.log(`📊 Progress updated: ${completedCount}/${this.totalLessons} lessons completed (${this.progress.toFixed(1)}%)`);
    }

    // 목차 업데이트
    updateTOC() {
        this.tocItems.forEach((item, index) => {
            const lessonNumber = index + 1;
            
            // 모든 클래스 초기화
            item.classList.remove('completed', 'current');
            
            // 현재 레슨 표시
            if (lessonNumber === this.currentLesson) {
                item.classList.add('current');
            }
            
            // 완료된 레슨 표시 (현재 레슨이 아닌 경우에만)
            if (this.completedLessons.has(lessonNumber) && lessonNumber !== this.currentLesson) {
                item.classList.add('completed');
            }
            
            // 현재 레슨이면서 완료된 레슨인 경우 current와 completed 모두 추가
            if (lessonNumber === this.currentLesson && this.completedLessons.has(lessonNumber)) {
                item.classList.add('current', 'completed');
            }
        });
    }

    // 네비게이션 업데이트
    updateNavigation() {
        // 이전 버튼들
        this.prevButtons.forEach(button => {
            const targetLesson = parseInt(button.getAttribute('data-prev'));
            button.style.display = (targetLesson >= 1) ? 'flex' : 'none';
        });
        
        // 다음 버튼들
        this.nextButtons.forEach(button => {
            const targetLesson = parseInt(button.getAttribute('data-next'));
            button.style.display = (targetLesson <= this.totalLessons) ? 'flex' : 'none';
        });
    }

    // 빠른 네비게이션 업데이트
    updateQuickNav() {
        if (this.prevQuickBtn) {
            this.prevQuickBtn.disabled = (this.currentLesson <= 1);
        }
        
        if (this.nextQuickBtn) {
            this.nextQuickBtn.disabled = (this.currentLesson >= this.totalLessons);
        }
        
        if (this.currentIndicator) {
            this.currentIndicator.textContent = `${this.currentLesson}`;
        }
    }

    // 키보드 단축키 처리
    handleKeyboardShortcuts(e) {
        // 입력 필드에 포커스가 있으면 단축키 비활성화
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.goToPreviousLesson();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.goToNextLesson();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
                e.preventDefault();
                const lessonNum = parseInt(e.key);
                if (lessonNum <= this.totalLessons) {
                    this.goToLesson(lessonNum);
                }
                break;
        }
    }

    // 저장된 진행상황 로드 (새로고침시 초기화되도록 제거)
    loadProgress() {
        return new Set(); // 항상 빈 Set 반환
    }

    // 진행상황 저장 (제거)
    saveProgress() {
        // 더 이상 localStorage에 저장하지 않음
    }

    // 디버그 정보
    debug() {
        console.log('🔍 NEO Regex Beginner Debug Info:');
        console.log('- Current lesson:', this.currentLesson);
        console.log('- Total lessons:', this.totalLessons);
        console.log('- Completed lessons:', Array.from(this.completedLessons));
        console.log('- Progress:', this.progress + '%');
        console.log('- Lesson articles found:', this.lessonArticles.length);
    }
}

// 전역 변수로 할당하여 HTML에서 접근 가능하게 함
let beginnerTool;

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    try {
        beginnerTool = new RegexBeginner();
        window.beginnerTool = beginnerTool; // 전역 접근 가능
        
        // 1초 후 디버그 정보 출력
        setTimeout(() => {
            beginnerTool.debug();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Failed to initialize RegexBeginner:', error);
        
        // 오류 발생시 사용자에게 알림
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px;
            border: 1px solid #feb2b2; max-width: 300px; font-family: Inter, sans-serif;
        `;
        errorDiv.innerHTML = `
            <strong>초기화 오류</strong><br>
            초보자 가이드를 불러오는 중 문제가 발생했습니다.<br>
            문제가 계속되면 개발자 도구의 콘솔을 확인해주세요.
            <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 10px; background: #c53030; color: white; border: none; border-radius: 4px; cursor: pointer;">새로고침</button>
        `;
        document.body.appendChild(errorDiv);
    }
});