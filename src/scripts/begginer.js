// NEO Regex Beginner - 초보자 가이드 및 학습 도구 (완전 수정 버전)

class RegexBeginner {
    constructor() {
        this.currentLesson = 1;
        this.totalLessons = 7; // HTML에 있는 실제 레슨 수
        this.completedLessons = this.loadProgress();
        this.progress = 0;
        this.interactiveMode = true;
        
        this.lessons = this.initializeLessons();
        this.init();
    }

    init() {
        console.log('DOM Content Loaded - waiting for complete initialization...');
        console.log('Attempting to initialize RegexBeginner...');
        
        this.bindElements();
        this.bindEvents();
        this.showCurrentLesson();
        this.updateProgress();
        this.updateTOC();
        this.updateNavigation();
        this.updateQuickNav();
        
        console.log('🎓 NEO Regex Beginner Guide initialized successfully!');
        
        // Auto-debug after 1 second
        setTimeout(() => {
            console.log('Auto-debugging beginner tool...');
            this.debug();
        }, 1000);
    }

    bindElements() {
        console.log('Binding elements...');
        
        // 기존 HTML 엘리먼트들
        this.lessonContent = document.getElementById('lesson-content');
        this.interactiveDemo = document.getElementById('interactive-demo');
        this.practiceArea = document.getElementById('practice-area');
        
        // Fallback 엘리먼트 생성
        if (!this.lessonContent) {
            console.log('Creating fallback element: lesson-content');
            this.lessonContent = document.createElement('div');
            this.lessonContent.id = 'lesson-content';
            this.lessonContent.className = 'lesson-content';
            document.body.appendChild(this.lessonContent);
            console.log('Fallback element lesson-content created and added to:', document.body.tagName);
        }
        
        if (!this.interactiveDemo) {
            this.interactiveDemo = document.createElement('div');
            this.interactiveDemo.id = 'interactive-demo';
            this.interactiveDemo.className = 'interactive-demo';
            this.lessonContent.appendChild(this.interactiveDemo);
        }
        
        if (!this.practiceArea) {
            this.practiceArea = document.createElement('div');
            this.practiceArea.id = 'practice-area';
            this.practiceArea.className = 'practice-area';
            this.lessonContent.appendChild(this.practiceArea);
        }
        
        // 기존 레슨 아티클들
        this.lessonArticles = document.querySelectorAll('.lesson');
        
        // Progress elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('lesson-progress');
        this.currentLessonEl = document.getElementById('current-lesson');
        this.totalLessonsEl = document.getElementById('total-lessons');
        
        // Table of contents
        this.tocItems = document.querySelectorAll('.toc-item');
        
        // Quick navigation
        this.quickNav = document.getElementById('quick-nav');
        this.prevQuickBtn = document.getElementById('prev-quick');
        this.nextQuickBtn = document.getElementById('next-quick');
        this.currentIndicator = document.getElementById('current-indicator');
        
        // 모든 레슨 네비게이션 버튼들
        this.nextButtons = document.querySelectorAll('.next-lesson');
        this.prevButtons = document.querySelectorAll('.prev-lesson');
        
        console.log('Elements bound:');
        console.log('- Lesson content:', !!this.lessonContent, this.lessonContent?.tagName);
        console.log('- Interactive demo:', !!this.interactiveDemo, this.interactiveDemo?.tagName);
        console.log('- Practice area:', !!this.practiceArea, this.practiceArea?.tagName);
        console.log('- TOC items:', this.tocItems.length);
        console.log('- Lesson articles:', this.lessonArticles.length);
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Quick navigation events
        this.prevQuickBtn?.addEventListener('click', () => {
            console.log('Quick prev clicked');
            this.goToPreviousLesson();
        });
        
        this.nextQuickBtn?.addEventListener('click', () => {
            console.log('Quick next clicked');
            this.goToNextLesson();
        });
        
        // 모든 다음 레슨 버튼들에 이벤트 바인딩
        this.nextButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const nextLesson = parseInt(button.getAttribute('data-next'));
                console.log(`Next button ${index} clicked, going to lesson ${nextLesson}`);
                if (nextLesson && nextLesson <= this.totalLessons) {
                    this.goToLesson(nextLesson);
                }
            });
        });
        
        // 모든 이전 레슨 버튼들에 이벤트 바인딩
        this.prevButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const prevLesson = parseInt(button.getAttribute('data-prev'));
                console.log(`Prev button ${index} clicked, going to lesson ${prevLesson}`);
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
                console.log(`TOC item clicked, going to lesson ${lessonNumber}`);
                this.goToLesson(lessonNumber);
            });
        });
        
        // HTML 기반 연습 문제 이벤트 바인딩 (레슨 2용)
        this.bindHtmlPracticeEvents();
        
        // 키보드 단축키
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        console.log('Events bound successfully');
    }

    // HTML 기반 연습 문제 이벤트 바인딩
    bindHtmlPracticeEvents() {
        // 레슨 2의 연습해보기 필드
        const practiceField = document.querySelector('.practice-field[data-lesson="2"]');
        const practiceResult = document.getElementById('practice-result-2');
        
        if (practiceField && practiceResult) {
            console.log('Found HTML practice elements for lesson 2');
            practiceField.addEventListener('input', (e) => {
                this.updateHtmlPracticeResult(e.target.value, practiceResult);
            });
        }
        
        // 모든 practice-field에 대해 이벤트 바인딩
        document.querySelectorAll('.practice-field').forEach(field => {
            field.addEventListener('input', (e) => {
                const lessonNum = e.target.getAttribute('data-lesson');
                const resultId = `practice-result-${lessonNum}`;
                const resultEl = document.getElementById(resultId);
                if (resultEl) {
                    this.updateHtmlPracticeResult(e.target.value, resultEl, lessonNum);
                }
            });
        });
    }

    // HTML 기반 연습 결과 업데이트
    updateHtmlPracticeResult(pattern, resultElement, lessonNum = '2') {
        const testTexts = {
            '2': 'I have a dog and a cat. My dog is very friendly. The cat likes to sleep.',
            '3': 'cat, cut, cot, c@t, c.t',
            '4': 'Hello World! This is a test.',
            '5': 'I have 5 apples and 3 oranges.',
            '6': 'Hello world\nGoodbye world\nHello there',
            '7': 'user@example.com'
        };
        
        const testText = testTexts[lessonNum] || testTexts['2'];
        
        if (!pattern.trim()) {
            resultElement.innerHTML = '<div class="no-result">패턴을 입력해보세요!</div>';
            return;
        }

        try {
            const regex = new RegExp(pattern, 'gi');
            const matches = [...testText.matchAll(regex)];

            if (matches.length > 0) {
                let highlightedText = testText;
                let offset = 0;

                matches.forEach(match => {
                    const start = match.index + offset;
                    const end = start + match[0].length;
                    const matchText = highlightedText.slice(start, end);
                    
                    const highlighted = `<mark style="background-color: #10b981; color: white; padding: 2px 4px; border-radius: 3px;">${matchText}</mark>`;
                    
                    highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
                    offset += highlighted.length - matchText.length;
                });

                resultElement.innerHTML = `
                    <div style="font-family: monospace; line-height: 1.6; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        ${highlightedText}
                    </div>
                    <div style="margin-top: 10px; color: #10b981; font-weight: 600;">
                        ✅ ${matches.length}개의 매칭을 찾았습니다!
                    </div>
                `;
            } else {
                resultElement.innerHTML = `
                    <div style="font-family: monospace; line-height: 1.6; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        ${testText}
                    </div>
                    <div style="margin-top: 10px; color: #6b7280;">
                        ℹ️ 매칭되는 항목이 없습니다.
                    </div>
                `;
            }
        } catch (error) {
            resultElement.innerHTML = `
                <div style="color: #ef4444; font-weight: 600;">
                    ❌ 오류: ${error.message}
                </div>
            `;
        }
    }

    initializeLessons() {
        return {
            1: {
                title: '정규식이란?',
                description: '정규식의 기본 개념과 용도를 알아봅시다.',
                content: {
                    theory: `
                        <h3>정규식이란?</h3>
                        <p>정규식(Regular Expression, Regex)은 <strong>텍스트 패턴을 표현하는 문자열</strong>입니다.</p>
                        
                        <div class="concept-box">
                            <h4>🎯 정규식으로 할 수 있는 것들</h4>
                            <ul>
                                <li>텍스트에서 특정 패턴 찾기</li>
                                <li>이메일, 전화번호 등의 형식 검증</li>
                                <li>텍스트 치환 및 가공</li>
                                <li>데이터 추출 및 파싱</li>
                            </ul>
                        </div>
                        
                        <h4>간단한 예제</h4>
                        <p>예를 들어, <code>cat</code>이라는 정규식은 텍스트에서 "cat"이라는 문자를 찾습니다.</p>
                    `,
                    interactive: {
                        pattern: 'cat',
                        testText: 'I have a cat and my cat is cute.',
                        explanation: '이 패턴은 텍스트에서 "cat"이라는 단어를 모두 찾습니다.'
                    },
                    practice: {
                        question: '"dog"라는 단어를 찾는 정규식을 작성해보세요.',
                        answer: 'dog',
                        testText: 'My dog is a good dog.',
                        hint: '정규식은 찾고자 하는 문자를 그대로 입력하면 됩니다.'
                    }
                }
            },
            2: {
                title: '리터럴 문자 매칭',
                description: '가장 기본적인 문자 매칭을 배워봅시다.',
                content: {
                    theory: `
                        <h3>리터럴 문자란?</h3>
                        <p>리터럴 문자는 <strong>그 자체로 매칭되는 일반적인 문자</strong>들입니다.</p>
                        
                        <div class="highlight-box">
                            <h4>💡 핵심 개념</h4>
                            <p>일반 문자(a-z, A-Z, 0-9)는 정규식에서 자기 자신과 정확히 매칭됩니다.</p>
                        </div>
                        
                        <h4>예제</h4>
                        <ul>
                            <li><code>hello</code> → "hello"라는 문자열을 찾습니다</li>
                            <li><code>123</code> → "123"이라는 숫자를 찾습니다</li>
                            <li><code>abc</code> → "abc"라는 연속된 문자를 찾습니다</li>
                        </ul>
                    `,
                    interactive: {
                        pattern: 'hello',
                        testText: 'Say hello to the world. Hello everyone!',
                        explanation: '패턴 "hello"가 텍스트에서 정확히 매칭되는 부분을 찾습니다. 대소문자를 구분한다는 점에 주목하세요.'
                    },
                    practice: {
                        question: '텍스트에서 "world"라는 단어를 찾는 정규식을 작성해보세요.',
                        answer: 'world',
                        testText: 'Hello world! This is a wonderful world.',
                        hint: '찾고자 하는 단어를 그대로 입력하면 됩니다.'
                    }
                }
            },
            3: {
                title: '특수 문자와 이스케이프',
                description: '점(.), 별표(*) 등 특별한 의미를 가진 문자들을 배워봅시다.',
                content: {
                    theory: `
                        <h3>특수 문자 (메타 문자)</h3>
                        <p>정규식에서 특별한 의미를 가지는 문자들입니다.</p>
                        
                        <div class="special-chars">
                            <h4>🔧 주요 특수 문자들</h4>
                            <ul>
                                <li><code>.</code> - 줄바꿈을 제외한 모든 문자</li>
                                <li><code>*</code> - 앞의 문자가 0개 이상</li>
                                <li><code>+</code> - 앞의 문자가 1개 이상</li>
                                <li><code>?</code> - 앞의 문자가 0개 또는 1개</li>
                                <li><code>^</code> - 문자열의 시작</li>
                                <li><code>$</code> - 문자열의 끝</li>
                            </ul>
                        </div>
                        
                        <h4>이스케이프 (\\)</h4>
                        <p>특수 문자를 문자 그대로 사용하려면 앞에 백슬래시(\\)를 붙입니다.</p>
                        <p>예: <code>\\.</code>는 실제 점(.) 문자를 찾습니다.</p>
                    `,
                    interactive: {
                        pattern: 'c.t',
                        testText: 'cat, cut, cot, c@t, c.t',
                        explanation: '점(.)은 임의의 한 문자를 의미합니다. "c"와 "t" 사이의 모든 문자에 매칭됩니다.'
                    },
                    practice: {
                        question: '실제 점(.) 문자를 찾는 정규식을 작성해보세요.',
                        answer: '\\.',
                        testText: 'This is a sentence. Another sentence.',
                        hint: '특수 문자를 문자 그대로 찾으려면 백슬래시를 앞에 붙이세요.'
                    }
                }
            },
            4: {
                title: '문자 클래스 [abc]',
                description: '[abc], [0-9] 같은 패턴들을 배워봅시다.',
                content: {
                    theory: `
                        <h3>문자 클래스</h3>
                        <p>대괄호 <code>[]</code> 안에 나열된 문자 중 하나와 매칭됩니다.</p>
                        
                        <div class="char-class-examples">
                            <h4>📝 기본 형태</h4>
                            <ul>
                                <li><code>[abc]</code> - a, b, c 중 하나</li>
                                <li><code>[0-9]</code> - 0부터 9까지의 숫자 중 하나</li>
                                <li><code>[a-z]</code> - 소문자 알파벳 중 하나</li>
                                <li><code>[A-Z]</code> - 대문자 알파벳 중 하나</li>
                                <li><code>[a-zA-Z]</code> - 모든 알파벳 중 하나</li>
                            </ul>
                        </div>
                        
                        <h4>부정 문자 클래스</h4>
                        <p><code>[^abc]</code> - a, b, c가 아닌 모든 문자</p>
                        
                        <h4>단축 표현</h4>
                        <ul>
                            <li><code>\\d</code> - 숫자 ([0-9]와 같음)</li>
                            <li><code>\\w</code> - 단어 문자 ([a-zA-Z0-9_]와 같음)</li>
                            <li><code>\\s</code> - 공백 문자</li>
                        </ul>
                    `,
                    interactive: {
                        pattern: '[aeiou]',
                        testText: 'Hello World! This is a test.',
                        explanation: '모음 문자 a, e, i, o, u 중 하나와 매칭됩니다.'
                    },
                    practice: {
                        question: '숫자 하나를 찾는 정규식을 작성해보세요.',
                        answer: '[0-9]',
                        testText: 'I have 5 apples and 3 oranges.',
                        hint: '0부터 9까지의 숫자를 대괄호 안에 범위로 표현하세요.'
                    }
                }
            },
            5: {
                title: '수량자 +, *, ?',
                description: '반복을 표현하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>수량자 (Quantifiers)</h3>
                        <p>앞의 문자나 그룹이 몇 번 반복될지를 지정합니다.</p>
                        
                        <div class="quantifier-table">
                            <h4>🔢 기본 수량자</h4>
                            <ul>
                                <li><code>*</code> - 0번 이상 (없어도 되고, 많아도 됨)</li>
                                <li><code>+</code> - 1번 이상 (최소 1번은 있어야 함)</li>
                                <li><code>?</code> - 0번 또는 1번 (있어도 되고 없어도 됨)</li>
                                <li><code>{n}</code> - 정확히 n번</li>
                                <li><code>{n,}</code> - n번 이상</li>
                                <li><code>{n,m}</code> - n번 이상 m번 이하</li>
                            </ul>
                        </div>
                        
                        <h4>실제 예제</h4>
                        <ul>
                            <li><code>a+</code> - a가 1개 이상: "a", "aa", "aaa"</li>
                            <li><code>a*</code> - a가 0개 이상: "", "a", "aa"</li>
                            <li><code>a?</code> - a가 0개 또는 1개: "", "a"</li>
                            <li><code>\\d{3}</code> - 숫자 정확히 3개: "123"</li>
                        </ul>
                    `,
                    interactive: {
                        pattern: 'a+',
                        testText: 'I have a cat, aa is fun, aaa sounds weird.',
                        explanation: 'a가 1개 이상 연속으로 나타나는 부분을 모두 찾습니다.'
                    },
                    practice: {
                        question: '숫자가 2개 이상 연속으로 나타나는 패턴을 작성해보세요.',
                        answer: '\\d{2,}',
                        testText: 'I have 5 cats, 12 dogs, and 100 birds.',
                        hint: '\\d와 중괄호를 사용해서 2개 이상을 표현해보세요.'
                    }
                }
            },
            6: {
                title: '위치 지정자 ^, $',
                description: '문자열의 시작과 끝을 지정하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>앵커 (Anchors)</h3>
                        <p>문자열의 특정 위치를 나타내는 특수 문자들입니다.</p>
                        
                        <div class="anchor-examples">
                            <h4>⚓ 위치 지정자</h4>
                            <ul>
                                <li><code>^</code> - 문자열의 시작 (라인의 처음)</li>
                                <li><code>$</code> - 문자열의 끝 (라인의 마지막)</li>
                                <li><code>\\b</code> - 단어 경계</li>
                                <li><code>\\B</code> - 단어 경계가 아닌 곳</li>
                            </ul>
                        </div>
                        
                        <h4>실용적인 예제</h4>
                        <ul>
                            <li><code>^Hello</code> - "Hello"로 시작하는 문자열</li>
                            <li><code>world$</code> - "world"로 끝나는 문자열</li>
                            <li><code>^Hello world$</code> - "Hello world"와 정확히 일치</li>
                            <li><code>\\bcat\\b</code> - "cat"이라는 완전한 단어</li>
                        </ul>
                        
                        <div class="tip-box">
                            <h4>💡 꿀팁</h4>
                            <p>입력 검증할 때 ^와 $를 함께 사용하면 전체 문자열이 패턴과 일치하는지 확인할 수 있어요!</p>
                        </div>
                    `,
                    interactive: {
                        pattern: '^Hello',
                        testText: 'Hello world\nGoodbye world\nHello there',
                        explanation: '각 라인의 시작 부분에서 "Hello"를 찾습니다.'
                    },
                    practice: {
                        question: '이메일 형식을 검증하는 간단한 패턴을 작성해보세요. (시작부터 끝까지)',
                        answer: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                        testText: 'user@example.com',
                        hint: '^로 시작하고 $로 끝나게 하고, @를 기준으로 앞뒤로 적절한 문자들을 배치하세요.'
                    }
                }
            },
            7: {
                title: '실전 예제',
                description: '이메일, 전화번호 패턴을 만들어봅시다.',
                content: {
                    theory: `
                        <h3>🎯 실전 정규식 패턴</h3>
                        <p>지금까지 배운 내용을 종합해서 실무에서 자주 사용하는 패턴들을 만들어봅시다.</p>
                        
                        <div class="real-world-patterns">
                            <h4>📧 이메일 주소</h4>
                            <p><code>^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$</code></p>
                            
                            <h4>📱 한국 전화번호</h4>
                            <p><code>^010-\\d{4}-\\d{4}$</code></p>
                            
                            <h4>🔒 비밀번호 (8자 이상, 문자+숫자)</h4>
                            <p><code>^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$</code></p>
                            
                            <h4>🌐 URL</h4>
                            <p><code>^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$</code></p>
                        </div>
                        
                        <div class="congratulations">
                            <h4>🎉 축하합니다!</h4>
                            <p>이제 여러분은 정규식의 기초를 완전히 마스터했습니다!</p>
                            <p>앞으로 더 복잡한 패턴들도 자신있게 만들 수 있을 거예요.</p>
                        </div>
                    `,
                    interactive: {
                        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                        testText: 'congratulations@regex.master',
                        explanation: '축하합니다! 이제 여러분도 정규식의 기초를 마스터했습니다!'
                    },
                    practice: {
                        question: '자유롭게 정규식을 작성해보세요. 무엇이든 좋습니다!',
                        answer: '.*',
                        testText: '여러분의 정규식 여정이 이제 시작됩니다!',
                        hint: '정답은 무엇이든 상관없습니다. 자신감을 가지세요!'
                    }
                }
            }
        };
    }

    // 현재 레슨을 보여주는 메서드 (HTML 기반 또는 동적 생성)
    showCurrentLesson() {
        console.log(`Showing lesson ${this.currentLesson}`);
        
        // HTML에 레슨이 있는 경우
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
        } else {
            // JavaScript로 동적 생성하는 경우
            this.loadCurrentLesson();
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadCurrentLesson() {
        const lesson = this.lessons[this.currentLesson];
        if (!lesson || !this.lessonContent) return;

        this.displayLessonContent(lesson);
        this.setupInteractiveDemo(lesson.content.interactive);
        this.setupPractice(lesson.content.practice);
    }

    displayLessonContent(lesson) {
        if (!this.lessonContent) return;

        this.lessonContent.innerHTML = `
            <div class="lesson-header">
                <span class="lesson-number">레슨 ${this.currentLesson}</span>
                <h1 class="lesson-title">${lesson.title}</h1>
                <p class="lesson-description">${lesson.description}</p>
            </div>
            <div class="lesson-theory">
                ${lesson.content.theory}
            </div>
        `;
    }

    setupInteractiveDemo(interactive) {
        if (!this.interactiveDemo || !interactive) return;

        this.interactiveDemo.innerHTML = `
            <div class="demo-header">
                <h3><i class="fas fa-play-circle"></i> 인터랙티브 데모</h3>
                <div class="demo-controls">
                    <button id="try-it-${this.currentLesson}" class="btn btn-primary">
                        <i class="fas fa-play"></i> 실행
                    </button>
                    <button id="reset-demo-${this.currentLesson}" class="btn btn-outline">
                        <i class="fas fa-undo"></i> 리셋
                    </button>
                </div>
            </div>
            
            <div class="demo-content">
                <div class="demo-input">
                    <label>정규식 패턴:</label>
                    <input type="text" id="demo-pattern-${this.currentLesson}" value="${interactive.pattern}" 
                           class="demo-pattern-input">
                </div>
                
                <div class="demo-test">
                    <label>테스트 텍스트:</label>
                    <div class="demo-text" id="demo-text-${this.currentLesson}">${interactive.testText}</div>
                </div>
                
                <div class="demo-result" id="demo-result-${this.currentLesson}">
                    <div class="demo-explanation">${interactive.explanation}</div>
                </div>
            </div>
        `;

        this.bindDemoEvents();
    }

    bindDemoEvents() {
        const tryItBtn = document.getElementById(`try-it-${this.currentLesson}`);
        const resetBtn = document.getElementById(`reset-demo-${this.currentLesson}`);
        const patternInput = document.getElementById(`demo-pattern-${this.currentLesson}`);

        tryItBtn?.addEventListener('click', () => this.runInteractiveDemo());
        resetBtn?.addEventListener('click', () => this.resetDemo());
        patternInput?.addEventListener('input', () => this.runInteractiveDemo());
    }

    runInteractiveDemo() {
        const patternInput = document.getElementById(`demo-pattern-${this.currentLesson}`);
        const textEl = document.getElementById(`demo-text-${this.currentLesson}`);
        const resultEl = document.getElementById(`demo-result-${this.currentLesson}`);
        
        if (!patternInput || !textEl || !resultEl) return;

        const pattern = patternInput.value;
        const originalText = this.lessons[this.currentLesson].content.interactive.testText;
        
        if (!pattern) {
            textEl.innerHTML = originalText;
            resultEl.innerHTML = '<div class="demo-explanation">패턴을 입력해주세요.</div>';
            return;
        }

        try {
            const regex = new RegExp(pattern, 'gi');
            const matches = [...originalText.matchAll(regex)];

            if (matches.length > 0) {
                let highlightedText = originalText;
                let offset = 0;

                matches.forEach(match => {
                    const start = match.index + offset;
                    const end = start + match[0].length;
                    const matchText = highlightedText.slice(start, end);
                    
                    const highlighted = `<mark class="demo-highlight">${matchText}</mark>`;
                    
                    highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
                    offset += highlighted.length - matchText.length;
                });

                textEl.innerHTML = highlightedText;
                resultEl.innerHTML = `
                    <div class="demo-success">
                        <i class="fas fa-check-circle"></i>
                        ${matches.length}개의 매칭을 찾았습니다!
                    </div>
                `;
            } else {
                textEl.innerHTML = originalText;
                resultEl.innerHTML = `
                    <div class="demo-info">
                        <i class="fas fa-info-circle"></i>
                        매칭되는 항목이 없습니다.
                    </div>
                `;
            }
        } catch (error) {
            resultEl.innerHTML = `
                <div class="demo-error">
                    <i class="fas fa-exclamation-circle"></i>
                    오류: ${error.message}
                </div>
            `;
        }
    }

    resetDemo() {
        const lesson = this.lessons[this.currentLesson];
        if (lesson?.content.interactive) {
            this.setupInteractiveDemo(lesson.content.interactive);
        }
    }

    setupPractice(practice) {
        if (!this.practiceArea || !practice) return;

        this.practiceArea.innerHTML = `
            <div class="practice-header">
                <h3><i class="fas fa-dumbbell"></i> 연습 문제</h3>
                <button id="show-hint-${this.currentLesson}" class="btn btn-sm btn-outline">
                    <i class="fas fa-lightbulb"></i> 힌트
                </button>
            </div>
            
            <div class="practice-content">
                <div class="practice-question">
                    <h4>문제</h4>
                    <p>${practice.question}</p>
                </div>
                
                <div class="practice-input-group">
                    <label for="practice-input-${this.currentLesson}">정규식을 입력하세요:</label>
                    <input type="text" id="practice-input-${this.currentLesson}" class="practice-input" 
                           placeholder="여기에 정규식을 작성하세요...">
                </div>
                
                <div class="practice-test-area">
                    <label>테스트 텍스트:</label>
                    <div class="test-text" id="test-text-${this.currentLesson}">${practice.testText}</div>
                </div>
                
                <div class="practice-controls">
                    <button id="check-answer-${this.currentLesson}" class="btn btn-primary">
                        <i class="fas fa-check"></i> 답 확인
                    </button>
                </div>
                
                <div id="practice-result-${this.currentLesson}" class="practice-result"></div>
                <div id="practice-hint-${this.currentLesson}" class="practice-hint" style="display: none;">
                    <i class="fas fa-lightbulb"></i>
                    <strong>힌트:</strong> ${practice.hint}
                </div>
            </div>
        `;

        this.bindPracticeEvents();
    }

    bindPracticeEvents() {
        const input = document.getElementById(`practice-input-${this.currentLesson}`);
        const checkBtn = document.getElementById(`check-answer-${this.currentLesson}`);
        const hintBtn = document.getElementById(`show-hint-${this.currentLesson}`);

        input?.addEventListener('input', () => this.updatePracticePreview());
        checkBtn?.addEventListener('click', () => this.checkPracticeAnswer());
        hintBtn?.addEventListener('click', () => this.showHint());
    }

    updatePracticePreview() {
        const input = document.getElementById(`practice-input-${this.currentLesson}`);
        const testText = document.getElementById(`test-text-${this.currentLesson}`);
        
        if (!input || !testText) return;

        const pattern = input.value;
        const originalText = this.lessons[this.currentLesson].content.practice.testText;
        
        if (!pattern) {
            testText.innerHTML = originalText;
            return;
        }

        try {
            const regex = new RegExp(pattern, 'g');
            const matches = [...originalText.matchAll(regex)];

            if (matches.length > 0) {
                let highlightedText = originalText;
                let offset = 0;

                matches.forEach((match, index) => {
                    const start = match.index + offset;
                    const end = start + match[0].length;
                    const matchText = highlightedText.slice(start, end);
                    
                    const highlighted = `<mark class="practice-highlight">${matchText}</mark>`;
                    
                    highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
                    offset += highlighted.length - matchText.length;
                });

                testText.innerHTML = highlightedText;
            } else {
                testText.innerHTML = originalText;
            }
        } catch (error) {
            testText.innerHTML = originalText;
        }
    }

    checkPracticeAnswer() {
        const input = document.getElementById(`practice-input-${this.currentLesson}`);
        const result = document.getElementById(`practice-result-${this.currentLesson}`);
        
        if (!input || !result) return;

        const userAnswer = input.value.trim();
        const correctAnswer = this.lessons[this.currentLesson].content.practice.answer;

        if (!userAnswer) {
            result.innerHTML = `
                <div class="result-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    정규식을 입력해주세요.
                </div>
            `;
            return;
        }

        const isCorrect = userAnswer === correctAnswer || this.checkAlternativeAnswer(userAnswer, correctAnswer);

        if (isCorrect) {
            result.innerHTML = `
                <div class="result-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>정답입니다!</strong> 잘했어요! 🎉
                </div>
            `;
            
            this.markLessonCompleted(this.currentLesson);
            
            if (this.currentLesson < this.totalLessons) {
                setTimeout(() => {
                    result.innerHTML += `
                        <div class="next-lesson-prompt">
                            <button onclick="window.beginnerTool.goToNextLesson()" class="btn btn-primary">
                                다음 레슨으로 <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    `;
                }, 1000);
            }
        } else {
            result.innerHTML = `
                <div class="result-error">
                    <i class="fas fa-times-circle"></i>
                    <strong>아직 정답이 아니에요.</strong> 다시 시도해보세요.
                    <details class="answer-details">
                        <summary>정답 보기</summary>
                        <code>${correctAnswer}</code>
                    </details>
                </div>
            `;
        }
    }

    checkAlternativeAnswer(userAnswer, correctAnswer) {
        // Check for equivalent patterns
        const alternatives = {
            '[0-9]': '\\d',
            '\\d': '[0-9]',
            '[a-zA-Z0-9_]': '\\w',
            '\\w': '[a-zA-Z0-9_]',
            '[ \\t\\n\\r\\f]': '\\s',
            '\\s': '[ \\t\\n\\r\\f]'
        };

        for (const [alt, main] of Object.entries(alternatives)) {
            if (userAnswer === correctAnswer.replace(main, alt)) {
                return true;
            }
        }

        return false;
    }

    showHint() {
        const hint = document.getElementById(`practice-hint-${this.currentLesson}`);
        if (hint) {
            hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
        }
    }

    // 레슨 이동 메서드들 (알림 제거)
    goToNextLesson() {
        if (this.currentLesson < this.totalLessons) {
            this.currentLesson++;
            this.showCurrentLesson();
            this.updateNavigation();
            this.updateQuickNav();
            this.updateTOC();
            this.saveProgress();
        }
    }

    goToPreviousLesson() {
        if (this.currentLesson > 1) {
            this.currentLesson--;
            this.showCurrentLesson();
            this.updateNavigation();
            this.updateQuickNav();
            this.updateTOC();
            this.saveProgress();
        }
    }

    goToLesson(lessonNumber) {
        if (lessonNumber >= 1 && lessonNumber <= this.totalLessons && lessonNumber !== this.currentLesson) {
            this.currentLesson = lessonNumber;
            this.showCurrentLesson();
            this.updateNavigation();
            this.updateQuickNav();
            this.updateTOC();
            this.saveProgress();
        }
    }

    // 네비게이션 상태 업데이트
    updateNavigation() {
        // Quick navigation 업데이트
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
        console.log(`Updating TOC for lesson ${this.currentLesson}`);
        
        this.tocItems.forEach((item) => {
            const lessonNumber = parseInt(item.getAttribute('data-lesson'));
            
            // Remove all states
            item.classList.remove('active', 'completed');
            
            // Add appropriate state
            if (lessonNumber === this.currentLesson) {
                item.classList.add('active');
                console.log(`Set lesson ${lessonNumber} as active`);
            } else if (this.completedLessons.includes(lessonNumber)) {
                item.classList.add('completed');
                console.log(`Set lesson ${lessonNumber} as completed`);
            }
        });
    }

    markLessonCompleted(lessonNumber) {
        if (!this.completedLessons.includes(lessonNumber)) {
            this.completedLessons.push(lessonNumber);
            this.saveProgress();
            this.updateProgress();
            this.updateTOC();
            
            // Show completion feedback
            this.showCompletionFeedback(lessonNumber);
        }
    }

    showCompletionFeedback(lessonNumber) {
        const messages = [
            '첫 번째 레슨 완료! 🎉',
            '기본 문자 매칭을 마스터했습니다! 👏',
            '특수 문자 사용법을 익혔네요! ✨',
            '문자 클래스 사용이 가능해졌습니다! 🔥',
            '수량자를 자유자재로 다룰 수 있어요! 💪',
            '앵커의 힘을 깨달았습니다! ⚓',
            '축하합니다! 정규식 마스터가 되었어요! 🏆'
        ];

        const message = messages[lessonNumber - 1] || '레슨 완료!';
        this.showNotification(message, 'success', 2000);
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
        
        // Enter to check answer
        if (e.key === 'Enter' && e.target.id && e.target.id.includes('practice-input')) {
            e.preventDefault();
            this.checkPracticeAnswer();
        }
        
        // F1 for hint
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHint();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} beginner-notification`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 스타일 적용
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                       type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                       'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            transform: 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px',
            fontWeight: '500'
        });

        document.body.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);

        // 자동 제거
        setTimeout(() => {
            notification.style.transform = 'translateX(-100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // 진행상황 저장/불러오기
    loadProgress() {
        try {
            const saved = localStorage.getItem('beginnerProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentLesson = data.currentLesson || 1;
                return data.completedLessons || [];
            }
            return [];
        } catch (e) {
            console.warn('Failed to load progress:', e);
            return [];
        }
    }

    saveProgress() {
        try {
            const progress = {
                currentLesson: this.currentLesson,
                completedLessons: this.completedLessons,
                timestamp: Date.now()
            };
            localStorage.setItem('beginnerProgress', JSON.stringify(progress));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }

    // 디버그 메서드
    debug() {
        console.log('=== Beginner Tool Debug Info ===');
        console.log(`Current lesson: ${this.currentLesson}`);
        console.log(`Total lessons: ${this.totalLessons}`);
        console.log(`Completed lessons: ${this.completedLessons}`);
        console.log(`Available lessons: ${Object.keys(this.lessons).join(',')}`);
        console.log('Elements found:');
        console.log('- Lesson content:', !!this.lessonContent, this.lessonContent?.tagName);
        console.log('- Interactive demo:', !!this.interactiveDemo, this.interactiveDemo?.tagName);
        console.log('- Practice area:', !!this.practiceArea, this.practiceArea?.tagName);
        console.log('- TOC items:', this.tocItems.length);
        console.log('- Lesson articles:', this.lessonArticles.length);
        console.log('Current lesson data:', this.lessons[this.currentLesson]?.title);
        console.log('=================================');
    }
}

// 전역 함수들
function debugBeginner() {
    if (window.beginnerTool) {
        window.beginnerTool.debug();
    } else {
        console.log('Beginner tool not initialized yet');
    }
}

function forceLoadLesson(n) {
    if (window.beginnerTool) {
        window.beginnerTool.goToLesson(n);
    } else {
        console.log('Beginner tool not initialized yet');
    }
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - waiting for complete initialization...');
    console.log('Attempting to initialize RegexBeginner...');
    try {
        window.beginnerTool = new RegexBeginner();
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

// 창이 완전히 로드된 후 디버그 정보 출력
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('Auto-debugging beginner tool...');
        debugBeginner();
    }, 1000);
});