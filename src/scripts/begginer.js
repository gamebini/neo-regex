// NEO Regex Beginner - 초보자 가이드 및 학습 도구

class RegexBeginner {
    constructor() {
        this.currentLesson = 1;
        this.totalLessons = 12;
        this.completedLessons = this.loadProgress();
        this.progress = 0;
        this.interactiveMode = true;
        
        this.lessons = this.initializeLessons();
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadCurrentLesson();
        this.updateProgress();
        this.updateTOC();
    }

    bindElements() {
        // Navigation elements
        this.prevBtn = document.getElementById('prev-lesson');
        this.nextBtn = document.getElementById('next-lesson');
        this.lessonSelect = document.getElementById('lesson-select');
        
        // Content areas
        this.lessonContent = document.getElementById('lesson-content');
        this.interactiveDemo = document.getElementById('interactive-demo');
        this.practiceArea = document.getElementById('practice-area');
        
        // Progress elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.currentLessonEl = document.getElementById('current-lesson');
        this.totalLessonsEl = document.getElementById('total-lessons');
        
        // Table of contents
        this.tocItems = document.querySelectorAll('.toc-item');
        
        // Quick navigation
        this.quickNav = document.getElementById('quick-nav');
        this.prevQuickBtn = document.getElementById('prev-quick');
        this.nextQuickBtn = document.getElementById('next-quick');
        this.currentIndicator = document.getElementById('current-indicator');
        
        // Interactive elements
        this.tryItBtn = document.getElementById('try-it');
        this.resetDemoBtn = document.getElementById('reset-demo');
        this.hintBtn = document.getElementById('show-hint');
        
        // Practice elements
        this.practiceInput = document.getElementById('practice-input');
        this.practiceTest = document.getElementById('practice-test');
        this.practiceResult = document.getElementById('practice-result');
        this.checkAnswerBtn = document.getElementById('check-answer');
    }

    bindEvents() {
        // Navigation events
        this.prevBtn?.addEventListener('click', () => this.goToPreviousLesson());
        this.nextBtn?.addEventListener('click', () => this.goToNextLesson());
        this.lessonSelect?.addEventListener('change', (e) => this.goToLesson(parseInt(e.target.value)));
        
        // Quick navigation
        this.prevQuickBtn?.addEventListener('click', () => this.goToPreviousLesson());
        this.nextQuickBtn?.addEventListener('click', () => this.goToNextLesson());
        
        // Table of contents
        this.tocItems.forEach(item => {
            item.addEventListener('click', () => {
                const lessonNumber = parseInt(item.getAttribute('data-lesson'));
                this.goToLesson(lessonNumber);
            });
        });
        
        // Interactive demo
        this.tryItBtn?.addEventListener('click', () => this.runInteractiveDemo());
        this.resetDemoBtn?.addEventListener('click', () => this.resetDemo());
        this.hintBtn?.addEventListener('click', () => this.showHint());
        
        // Practice area
        this.checkAnswerBtn?.addEventListener('click', () => this.checkPracticeAnswer());
        this.practiceInput?.addEventListener('input', () => this.handlePracticeInput());
        this.practiceTest?.addEventListener('input', () => this.updatePracticePreview());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
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
                        <h3>리터럴 문자 매칭</h3>
                        <p>가장 기본적인 정규식은 <strong>리터럴 문자</strong>를 그대로 매칭하는 것입니다.</p>
                        
                        <div class="example-box">
                            <h4>📝 예제</h4>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭</th><th>설명</th></tr>
                                <tr><td><code>hello</code></td><td>"hello"</td><td>정확히 "hello"와 매칭</td></tr>
                                <tr><td><code>123</code></td><td>"123"</td><td>숫자 "123"과 매칭</td></tr>
                                <tr><td><code>@</code></td><td>"@"</td><td>@ 기호와 매칭</td></tr>
                            </table>
                        </div>
                        
                        <div class="tip-box">
                            <h4>💡 팁</h4>
                            <p>정규식은 <strong>대소문자를 구분</strong>합니다. "Hello"와 "hello"는 다릅니다!</p>
                        </div>
                    `,
                    interactive: {
                        pattern: 'hello',
                        testText: 'Hello world! Say hello to regex. HELLO there!',
                        explanation: '"hello" 패턴은 소문자 "hello"만 매칭하고, "Hello"나 "HELLO"는 매칭하지 않습니다.'
                    },
                    practice: {
                        question: '"world"라는 단어를 찾는 정규식을 작성하고, 왜 "World"는 매칭되지 않는지 설명해보세요.',
                        answer: 'world',
                        testText: 'Hello world! Welcome to the World of regex.',
                        hint: '정규식은 대소문자를 구분합니다.'
                    }
                }
            },
            3: {
                title: '특수 문자와 이스케이프',
                description: '정규식에서 특별한 의미를 가진 문자들을 알아봅시다.',
                content: {
                    theory: `
                        <h3>특수 문자와 이스케이프</h3>
                        <p>정규식에서 <strong>특별한 의미를 가진 문자</strong>들이 있습니다. 이런 문자들을 리터럴로 사용하려면 <strong>이스케이프</strong>해야 합니다.</p>
                        
                        <div class="special-chars-box">
                            <h4>🔥 특수 문자들</h4>
                            <div class="chars-grid">
                                <div class="char-item"><code>.</code> 임의의 문자</div>
                                <div class="char-item"><code>*</code> 0개 이상 반복</div>
                                <div class="char-item"><code>+</code> 1개 이상 반복</div>
                                <div class="char-item"><code>?</code> 0개 또는 1개</div>
                                <div class="char-item"><code>^</code> 시작</div>
                                <div class="char-item"><code>$</code> 끝</div>
                                <div class="char-item"><code>[</code> 문자 클래스 시작</div>
                                <div class="char-item"><code>]</code> 문자 클래스 끝</div>
                                <div class="char-item"><code>(</code> 그룹 시작</div>
                                <div class="char-item"><code>)</code> 그룹 끝</div>
                                <div class="char-item"><code>{</code> 수량자 시작</div>
                                <div class="char-item"><code>}</code> 수량자 끝</div>
                            </div>
                        </div>
                        
                        <div class="escape-box">
                            <h4>🛡️ 이스케이프하기</h4>
                            <p>특수 문자를 리터럴로 사용하려면 앞에 <strong>백슬래시(\\)</strong>를 붙입니다.</p>
                            <table class="example-table">
                                <tr><th>리터럴 매칭</th><th>정규식</th><th>설명</th></tr>
                                <tr><td>"."</td><td><code>\\.</code></td><td>점 문자 하나</td></tr>
                                <tr><td>"$10"</td><td><code>\\$10</code></td><td>달러 기호와 10</td></tr>
                                <tr><td>"(hello)"</td><td><code>\\(hello\\)</code></td><td>괄호 포함</td></tr>
                            </table>
                        </div>
                    `,
                    interactive: {
                        pattern: '\\.',
                        testText: 'Hello. How are you? I am fine.',
                        explanation: '\\. 패턴은 점(.) 문자를 리터럴로 매칭합니다. 이스케이프하지 않으면 임의의 문자를 의미합니다.'
                    },
                    practice: {
                        question: '"$"를 찾는 정규식을 작성해보세요.',
                        answer: '\\$',
                        testText: 'Price: $29.99, Cost: $15.00',
                        hint: '$는 특수 문자이므로 이스케이프가 필요합니다.'
                    }
                }
            },
            4: {
                title: '문자 클래스 [abc]',
                description: '여러 문자 중 하나를 매칭하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>문자 클래스 [abc]</h3>
                        <p><strong>대괄호 []</strong>를 사용하여 여러 문자 중 하나를 매칭할 수 있습니다.</p>
                        
                        <div class="example-box">
                            <h4>📝 기본 예제</h4>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭</th><th>설명</th></tr>
                                <tr><td><code>[abc]</code></td><td>a, b, c</td><td>a, b, c 중 하나</td></tr>
                                <tr><td><code>[123]</code></td><td>1, 2, 3</td><td>1, 2, 3 중 하나</td></tr>
                                <tr><td><code>[aeiou]</code></td><td>모음</td><td>영어 모음 중 하나</td></tr>
                            </table>
                        </div>
                        
                        <div class="range-box">
                            <h4>📏 범위 사용하기</h4>
                            <p><strong>하이픈(-)</strong>을 사용하여 범위를 지정할 수 있습니다.</p>
                            <table class="example-table">
                                <tr><th>정규식</th><th>의미</th><th>매칭</th></tr>
                                <tr><td><code>[a-z]</code></td><td>소문자</td><td>a부터 z까지</td></tr>
                                <tr><td><code>[A-Z]</code></td><td>대문자</td><td>A부터 Z까지</td></tr>
                                <tr><td><code>[0-9]</code></td><td>숫자</td><td>0부터 9까지</td></tr>
                                <tr><td><code>[a-zA-Z0-9]</code></td><td>영숫자</td><td>알파벳과 숫자</td></tr>
                            </table>
                        </div>
                        
                        <div class="negation-box">
                            <h4>🚫 부정 문자 클래스 [^abc]</h4>
                            <p><strong>캐럿(^)</strong>을 첫 번째에 사용하면 해당 문자들을 <em>제외</em>합니다.</p>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭</th><th>설명</th></tr>
                                <tr><td><code>[^aeiou]</code></td><td>자음</td><td>모음이 아닌 문자</td></tr>
                                <tr><td><code>[^0-9]</code></td><td>숫자가 아님</td><td>숫자가 아닌 문자</td></tr>
                            </table>
                        </div>
                    `,
                    interactive: {
                        pattern: '[aeiou]',
                        testText: 'Hello World! How are you?',
                        explanation: '[aeiou] 패턴은 영어 모음 a, e, i, o, u 중 하나를 매칭합니다.'
                    },
                    practice: {
                        question: '숫자 0-5 중 하나를 매칭하는 정규식을 작성해보세요.',
                        answer: '[0-5]',
                        testText: '숫자: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9',
                        hint: '대괄호 안에 범위를 지정하세요.'
                    }
                }
            },
            5: {
                title: '수량자 *, +, ?',
                description: '문자나 패턴의 반복을 표현하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>수량자 (Quantifiers)</h3>
                        <p><strong>수량자</strong>는 앞의 문자나 그룹이 얼마나 반복되는지를 지정합니다.</p>
                        
                        <div class="quantifiers-box">
                            <h4>🔢 기본 수량자</h4>
                            <table class="example-table">
                                <tr><th>수량자</th><th>의미</th><th>예제</th><th>매칭</th></tr>
                                <tr><td><code>*</code></td><td>0개 이상</td><td><code>a*</code></td><td>"", "a", "aa", "aaa"</td></tr>
                                <tr><td><code>+</code></td><td>1개 이상</td><td><code>a+</code></td><td>"a", "aa", "aaa" (""는 안됨)</td></tr>
                                <tr><td><code>?</code></td><td>0개 또는 1개</td><td><code>a?</code></td><td>"", "a"</td></tr>
                            </table>
                        </div>
                        
                        <div class="practical-examples">
                            <h4>💼 실용적인 예제</h4>
                            <div class="example-grid">
                                <div class="example-item">
                                    <strong>색상 코드</strong><br>
                                    <code>#[0-9a-f]+</code><br>
                                    <small>#ff0000, #123, #abc123</small>
                                </div>
                                <div class="example-item">
                                    <strong>선택적 s</strong><br>
                                    <code>cats?</code><br>
                                    <small>"cat" 또는 "cats"</small>
                                </div>
                                <div class="example-item">
                                    <strong>여러 공백</strong><br>
                                    <code> +</code><br>
                                    <small>하나 이상의 공백</small>
                                </div>
                                <div class="example-item">
                                    <strong>숫자</strong><br>
                                    <code>[0-9]+</code><br>
                                    <small>하나 이상의 숫자</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="warning-box">
                            <h4>⚠️ 주의사항</h4>
                            <p><code>*</code>과 <code>+</code>는 <strong>탐욕적(greedy)</strong>입니다. 가능한 한 많이 매칭하려고 합니다.</p>
                        </div>
                    `,
                    interactive: {
                        pattern: 'o+',
                        testText: 'foo, food, good, gooood!',
                        explanation: 'o+ 패턴은 하나 이상의 연속된 o를 매칭합니다.'
                    },
                    practice: {
                        question: '하나 이상의 숫자를 매칭하는 정규식을 작성해보세요.',
                        answer: '[0-9]+',
                        testText: '가격: 1000원, 수량: 5개, 총합: 25000원',
                        hint: '문자 클래스와 + 수량자를 함께 사용하세요.'
                    }
                }
            },
            6: {
                title: '앵커 ^, $',
                description: '문자열의 시작과 끝을 매칭하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>앵커 (Anchors)</h3>
                        <p><strong>앵커</strong>는 특정 위치를 지정하는 특수 문자입니다.</p>
                        
                        <div class="anchors-box">
                            <h4>🎯 앵커의 종류</h4>
                            <table class="example-table">
                                <tr><th>앵커</th><th>의미</th><th>예제</th><th>매칭</th></tr>
                                <tr><td><code>^</code></td><td>문자열의 시작</td><td><code>^Hello</code></td><td>시작하는 "Hello"</td></tr>
                                <tr><td><code>$</code></td><td>문자열의 끝</td><td><code>end$</code></td><td>끝나는 "end"</td></tr>
                                <tr><td><code>^...$</code></td><td>전체 문자열</td><td><code>^Hello$</code></td><td>정확히 "Hello"만</td></tr>
                            </table>
                        </div>
                        
                        <div class="comparison-box">
                            <h4>🔄 비교해보기</h4>
                            <div class="comparison-grid">
                                <div class="comparison-item">
                                    <strong>앵커 없음</strong><br>
                                    <code>cat</code><br>
                                    <small>"cat", "catch", "duplicate" 모두 매칭</small>
                                </div>
                                <div class="comparison-item">
                                    <strong>시작 앵커</strong><br>
                                    <code>^cat</code><br>
                                    <small>"cat", "catch"는 매칭, "duplicate"는 안됨</small>
                                </div>
                                <div class="comparison-item">
                                    <strong>끝 앵커</strong><br>
                                    <code>cat$</code><br>
                                    <small>"cat", "duplicate"는 매칭, "catch"는 안됨</small>
                                </div>
                                <div class="comparison-item">
                                    <strong>정확한 매칭</strong><br>
                                    <code>^cat$</code><br>
                                    <small>오직 "cat"만 매칭</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="practical-box">
                            <h4>💼 실용 예제</h4>
                            <ul>
                                <li><code>^[A-Z]</code> - 대문자로 시작하는지 확인</li>
                                <li><code>[.!?]$</code> - 문장부호로 끝나는지 확인</li>
                                <li><code>^[0-9]+$</code> - 전체가 숫자인지 확인</li>
                                <li><code>^$</code> - 빈 문자열인지 확인</li>
                            </ul>
                        </div>
                    `,
                    interactive: {
                        pattern: '^Hello',
                        testText: 'Hello world!\nGood morning!\nHello there!',
                        explanation: '^Hello 패턴은 문자열의 시작에 있는 "Hello"만 매칭합니다.'
                    },
                    practice: {
                        question: '숫자로만 이루어진 전체 문자열을 매칭하는 정규식을 작성해보세요.',
                        answer: '^[0-9]+$',
                        testText: '123\nabc123\n456\n789abc',
                        hint: '시작(^)과 끝($) 앵커를 모두 사용하세요.'
                    }
                }
            },
            // 추가 레슨들...
            7: {
                title: '점(.) - 임의의 문자',
                description: '줄바꿈을 제외한 모든 문자를 매칭하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>점(.) - 와일드카드</h3>
                        <p><strong>점(.)</strong>은 줄바꿈 문자를 제외한 <em>모든 문자</em>를 매칭하는 와일드카드입니다.</p>
                        
                        <div class="dot-examples">
                            <h4>📝 점(.) 사용 예제</h4>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭 예제</th><th>설명</th></tr>
                                <tr><td><code>c.t</code></td><td>cat, cut, c@t, c5t</td><td>c와 t 사이에 임의의 문자 하나</td></tr>
                                <tr><td><code>.at</code></td><td>cat, bat, hat, @at</td><td>앞에 임의의 문자 하나 + at</td></tr>
                                <tr><td><code>...</code></td><td>abc, 123, @#$</td><td>임의의 문자 3개</td></tr>
                            </table>
                        </div>
                        
                        <div class="warning-box">
                            <h4>⚠️ 주의사항</h4>
                            <ul>
                                <li>점(.)은 <strong>줄바꿈 문자(\\n)는 매칭하지 않습니다</strong></li>
                                <li>리터럴 점을 매칭하려면 <code>\\.</code>로 이스케이프하세요</li>
                                <li><code>.*</code>는 매우 자주 사용되지만 조심해서 사용하세요 (탐욕적)</li>
                            </ul>
                        </div>
                        
                        <div class="practical-examples">
                            <h4>💼 실용적인 활용</h4>
                            <div class="example-grid">
                                <div class="example-item">
                                    <strong>파일 확장자</strong><br>
                                    <code>.*\\.jpg$</code><br>
                                    <small>JPG 파일명 매칭</small>
                                </div>
                                <div class="example-item">
                                    <strong>전화번호 패턴</strong><br>
                                    <code>010-....</code><br>
                                    <small>010-으로 시작하는 4자리</small>
                                </div>
                                <div class="example-item">
                                    <strong>단어 사이</strong><br>
                                    <code>is.a</code><br>
                                    <small>is와 a 사이에 문자 하나</small>
                                </div>
                            </div>
                        </div>
                    `,
                    interactive: {
                        pattern: 'c.t',
                        testText: 'cat, cut, cot, c@t, c5t, ct',
                        explanation: 'c.t 패턴은 c와 t 사이에 임의의 문자가 정확히 하나 있는 패턴을 매칭합니다.'
                    },
                    practice: {
                        question: '3글자로 이루어진 모든 단어를 매칭하는 정규식을 작성해보세요.',
                        answer: '...',
                        testText: 'cat dog elephant ant bee',
                        hint: '점(.)을 3개 연속으로 사용하세요.'
                    }
                }
            },
            8: {
                title: '미리 정의된 문자 클래스',
                description: '\\d, \\w, \\s 같은 편리한 단축 표현을 배워봅시다.',
                content: {
                    theory: `
                        <h3>미리 정의된 문자 클래스</h3>
                        <p>자주 사용되는 문자 그룹을 위한 <strong>단축 표현</strong>들이 있습니다.</p>
                        
                        <div class="predefined-classes">
                            <h4>📚 주요 문자 클래스</h4>
                            <table class="example-table">
                                <tr><th>클래스</th><th>의미</th><th>동등한 표현</th><th>매칭 예제</th></tr>
                                <tr><td><code>\\d</code></td><td>숫자</td><td><code>[0-9]</code></td><td>0, 1, 2, ..., 9</td></tr>
                                <tr><td><code>\\w</code></td><td>단어 문자</td><td><code>[a-zA-Z0-9_]</code></td><td>a, Z, 5, _</td></tr>
                                <tr><td><code>\\s</code></td><td>공백 문자</td><td><code>[ \\t\\n\\r\\f]</code></td><td>스페이스, 탭, 줄바꿈</td></tr>
                            </table>
                        </div>
                        
                        <div class="negated-classes">
                            <h4>🚫 부정 문자 클래스</h4>
                            <p>대문자로 쓰면 <strong>반대</strong>의 의미가 됩니다.</p>
                            <table class="example-table">
                                <tr><th>클래스</th><th>의미</th><th>동등한 표현</th><th>매칭 예제</th></tr>
                                <tr><td><code>\\D</code></td><td>숫자가 아님</td><td><code>[^0-9]</code></td><td>a, Z, !, @</td></tr>
                                <tr><td><code>\\W</code></td><td>단어 문자가 아님</td><td><code>[^a-zA-Z0-9_]</code></td><td>!, @, #, $</td></tr>
                                <tr><td><code>\\S</code></td><td>공백이 아님</td><td><code>[^ \\t\\n\\r\\f]</code></td><td>모든 비공백 문자</td></tr>
                            </table>
                        </div>
                        
                        <div class="practical-examples">
                            <h4>💼 실용 예제</h4>
                            <div class="example-grid">
                                <div class="example-item">
                                    <strong>전화번호</strong><br>
                                    <code>\\d{3}-\\d{4}-\\d{4}</code><br>
                                    <small>010-1234-5678 형태</small>
                                </div>
                                <div class="example-item">
                                    <strong>단어</strong><br>
                                    <code>\\w+</code><br>
                                    <small>하나 이상의 단어 문자</small>
                                </div>
                                <div class="example-item">
                                    <strong>공백 제거</strong><br>
                                    <code>\\s+</code><br>
                                    <small>하나 이상의 공백</small>
                                </div>
                                <div class="example-item">
                                    <strong>숫자 추출</strong><br>
                                    <code>\\d+</code><br>
                                    <small>연속된 숫자</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tip-box">
                            <h4>💡 팁</h4>
                            <p><code>[0-9]</code> 대신 <code>\\d</code>를 사용하면 더 읽기 쉽고 간결합니다!</p>
                        </div>
                    `,
                    interactive: {
                        pattern: '\\w+@\\w+\\.\\w+',
                        testText: 'Contact: john@example.com or support@site.org',
                        explanation: '이 패턴은 간단한 이메일 형태를 매칭합니다. \\w+는 단어 문자들, \\.는 리터럴 점을 의미합니다.'
                    },
                    practice: {
                        question: '연속된 숫자 4개를 매칭하는 정규식을 작성해보세요 (예: 1234, 5678)',
                        answer: '\\d{4}',
                        testText: '년도: 2024, 코드: 1234, 번호: 5678',
                        hint: '\\d와 중괄호 수량자를 사용하세요.'
                    }
                }
            },
            9: {
                title: '그룹 ()',
                description: '패턴을 그룹화하고 부분 매칭을 추출하는 방법을 배워봅시다.',
                content: {
                    theory: `
                        <h3>그룹 (Groups)</h3>
                        <p><strong>괄호 ()</strong>를 사용하여 패턴을 그룹화하고 부분 매칭 결과를 캡처할 수 있습니다.</p>
                        
                        <div class="groups-purpose">
                            <h4>🎯 그룹의 용도</h4>
                            <ul>
                                <li><strong>패턴 그룹화</strong>: 수량자를 여러 문자에 적용</li>
                                <li><strong>데이터 추출</strong>: 매칭된 부분을 별도로 추출</li>
                                <li><strong>참조</strong>: 같은 내용을 다시 매칭할 때 사용</li>
                            </ul>
                        </div>
                        
                        <div class="group-examples">
                            <h4>📝 그룹 예제</h4>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭</th><th>그룹 1</th><th>설명</th></tr>
                                <tr><td><code>(cat)+</code></td><td>catcatcat</td><td>cat</td><td>"cat"을 하나 이상 반복</td></tr>
                                <tr><td><code>(\\d{4})-(\\d{2})</code></td><td>2024-12</td><td>2024, 12</td><td>연도와 월을 각각 캡처</td></tr>
                                <tr><td><code>Hello (\\w+)!</code></td><td>Hello world!</td><td>world</td><td>인사말에서 이름 추출</td></tr>
                            </table>
                        </div>
                        
                        <div class="practical-example">
                            <h4>💼 실용적인 예: 전화번호 파싱</h4>
                            <div class="code-example">
                                <strong>정규식:</strong> <code>(\\d{3})-(\\d{4})-(\\d{4})</code><br>
                                <strong>텍스트:</strong> "010-1234-5678"<br>
                                <strong>결과:</strong><br>
                                - 전체 매칭: "010-1234-5678"<br>
                                - 그룹 1: "010" (지역번호)<br>
                                - 그룹 2: "1234" (교환번호)<br>
                                - 그룹 3: "5678" (번호)
                            </div>
                        </div>
                        
                        <div class="non-capturing">
                            <h4>🔍 비캡처 그룹 (?:...)</h4>
                            <p>그룹화는 하되 결과를 캡처하지 않으려면 <code>(?:...)</code>를 사용합니다.</p>
                            <table class="example-table">
                                <tr><th>캡처 그룹</th><th>비캡처 그룹</th><th>차이점</th></tr>
                                <tr><td><code>(cat)+</code></td><td><code>(?:cat)+</code></td><td>둘 다 동일하게 매칭하지만, 비캡처 그룹은 결과를 저장하지 않음</td></tr>
                            </table>
                        </div>
                    `,
                    interactive: {
                        pattern: '(\\w+)@(\\w+)\\.(\\w+)',
                        testText: 'john@example.com',
                        explanation: '이 패턴은 이메일을 파싱하여 사용자명, 도메인명, 최상위 도메인을 각각 캡처합니다.'
                    },
                    practice: {
                        question: '날짜 "2024-03-15"에서 연도, 월, 일을 각각 캡처하는 정규식을 작성해보세요.',
                        answer: '(\\d{4})-(\\d{2})-(\\d{2})',
                        testText: '오늘은 2024-03-15입니다.',
                        hint: '각각을 괄호로 묶어 세 개의 그룹을 만드세요.'
                    }
                }
            },
            10: {
                title: '선택 |',
                description: '여러 대안 중 하나를 선택하는 OR 연산을 배워봅시다.',
                content: {
                    theory: `
                        <h3>선택 (Alternation) |</h3>
                        <p><strong>파이프 |</strong>를 사용하여 여러 패턴 중 하나를 매칭할 수 있습니다. 이는 <em>OR 연산</em>과 같습니다.</p>
                        
                        <div class="alternation-basics">
                            <h4>📝 기본 사용법</h4>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭</th><th>설명</th></tr>
                                <tr><td><code>cat|dog</code></td><td>"cat" 또는 "dog"</td><td>고양이나 개</td></tr>
                                <tr><td><code>yes|no|maybe</code></td><td>"yes", "no", "maybe"</td><td>세 가지 응답</td></tr>
                                <tr><td><code>Mr|Ms|Dr</code></td><td>"Mr", "Ms", "Dr"</td><td>호칭</td></tr>
                            </table>
                        </div>
                        
                        <div class="grouping-alternation">
                            <h4>🔗 그룹과 함께 사용하기</h4>
                            <p>괄호와 함께 사용하면 더 복잡한 패턴을 만들 수 있습니다.</p>
                            <table class="example-table">
                                <tr><th>정규식</th><th>매칭 예제</th><th>설명</th></tr>
                                <tr><td><code>(cat|dog)s?</code></td><td>"cat", "cats", "dog", "dogs"</td><td>단수/복수 형태</td></tr>
                                <tr><td><code>I (love|like|hate) cats</code></td><td>"I love cats"<br>"I like cats"<br>"I hate cats"</td><td>감정 표현</td></tr>
                                <tr><td><code>colou?r|color</code></td><td>"color", "colour"</td><td>미국/영국 철자</td></tr>
                            </table>
                        </div>
                        
                        <div class="practical-examples">
                            <h4>💼 실용 예제</h4>
                            <div class="example-grid">
                                <div class="example-item">
                                    <strong>파일 확장자</strong><br>
                                    <code>\\.(jpg|jpeg|png|gif)$</code><br>
                                    <small>이미지 파일 매칭</small>
                                </div>
                                <div class="example-item">
                                    <strong>프로토콜</strong><br>
                                    <code>(http|https|ftp)://</code><br>
                                    <small>다양한 URL 프로토콜</small>
                                </div>
                                <div class="example-item">
                                    <strong>응답</strong><br>
                                    <code>(yes|no|ok|cancel)</code><br>
                                    <small>사용자 응답</small>
                                </div>
                                <div class="example-item">
                                    <strong>날씨</strong><br>
                                    <code>(sunny|rainy|cloudy|snowy)</code><br>
                                    <small>날씨 상태</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="precedence-note">
                            <h4>⚖️ 우선순위 주의</h4>
                            <p>선택 연산자 |는 <strong>낮은 우선순위</strong>를 가집니다. 필요시 괄호로 그룹화하세요.</p>
                            <div class="comparison">
                                <div class="wrong">❌ <code>cat|dogs?</code> → "cat" 또는 "dogs?" (s는 선택적이지 않음)</div>
                                <div class="right">✅ <code>(cat|dog)s?</code> → "cat", "cats", "dog", "dogs"</div>
                            </div>
                        </div>
                    `,
                    interactive: {
                        pattern: '(Mr|Ms|Dr)\\. \\w+',
                        testText: 'Mr. Smith, Ms. Johnson, Dr. Brown, Professor Lee',
                        explanation: '이 패턴은 호칭(Mr, Ms, Dr) 다음에 점과 공백, 그리고 이름이 오는 패턴을 매칭합니다.'
                    },
                    practice: {
                        question: '"good", "great", "excellent" 중 하나를 매칭하는 정규식을 작성해보세요.',
                        answer: 'good|great|excellent',
                        testText: 'This is good. That was great! Excellent work!',
                        hint: '파이프(|) 기호로 각 단어를 구분하세요.'
                    }
                }
            },
            11: {
                title: '실전 예제: 이메일 검증',
                description: '지금까지 배운 내용을 종합하여 이메일 주소를 검증해봅시다.',
                content: {
                    theory: `
                        <h3>실전 예제: 이메일 주소 검증</h3>
                        <p>지금까지 배운 모든 개념을 활용하여 <strong>이메일 주소를 검증하는 정규식</strong>을 만들어봅시다.</p>
                        
                        <div class="email-anatomy">
                            <h4>📧 이메일 구조 분석</h4>
                            <div class="email-breakdown">
                                <div class="email-example">user123@example.com</div>
                                <div class="parts">
                                    <div class="part local">
                                        <span class="label">로컬 부분</span>
                                        <span class="desc">사용자명 (영숫자, 점, 밑줄, 하이픈, +)</span>
                                    </div>
                                    <div class="part at">@</div>
                                    <div class="part domain">
                                        <span class="label">도메인 부분</span>
                                        <span class="desc">도메인명 + 최상위 도메인</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-by-step">
                            <h4>🔧 단계별 구축</h4>
                            
                            <div class="step">
                                <h5>1단계: 로컬 부분 (사용자명)</h5>
                                <p><code>[a-zA-Z0-9._%+-]+</code></p>
                                <small>영문자, 숫자, 특수문자(._%+-) 하나 이상</small>
                            </div>
                            
                            <div class="step">
                                <h5>2단계: @ 기호</h5>
                                <p><code>@</code></p>
                                <small>리터럴 @ 문자</small>
                            </div>
                            
                            <div class="step">
                                <h5>3단계: 도메인명</h5>
                                <p><code>[a-zA-Z0-9.-]+</code></p>
                                <small>영문자, 숫자, 점, 하이픈 하나 이상</small>
                            </div>
                            
                            <div class="step">
                                <h5>4단계: 최상위 도메인</h5>
                                <p><code>\\.[a-zA-Z]{2,}</code></p>
                                <small>점 + 2글자 이상의 영문자</small>
                            </div>
                            
                            <div class="step final">
                                <h5>최종 조합 + 앵커</h5>
                                <p><code>^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$</code></p>
                                <small>전체 문자열이 이메일 형식과 정확히 일치</small>
                            </div>
                        </div>
                        
                        <div class="test-examples">
                            <h4>🧪 테스트 예제</h4>
                            <div class="test-grid">
                                <div class="valid-examples">
                                    <h5>✅ 유효한 이메일</h5>
                                    <ul>
                                        <li>user@example.com</li>
                                        <li>john.doe@company.org</li>
                                        <li>test123@site.co.kr</li>
                                        <li>user+tag@domain.net</li>
                                    </ul>
                                </div>
                                <div class="invalid-examples">
                                    <h5>❌ 무효한 이메일</h5>
                                    <ul>
                                        <li>user@domain (최상위 도메인 없음)</li>
                                        <li>@example.com (사용자명 없음)</li>
                                        <li>user.domain.com (@ 없음)</li>
                                        <li>user@.com (도메인명 없음)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="limitations">
                            <h4>⚠️ 현실적인 한계</h4>
                            <p>이 정규식은 <strong>기본적인 이메일 형식</strong>만 검증합니다. 실제로는:</p>
                            <ul>
                                <li>RFC 표준에 완전히 준수하지 않음</li>
                                <li>특수한 형태의 이메일은 처리하지 못함</li>
                                <li>실제 이메일 존재 여부는 확인하지 못함</li>
                            </ul>
                            <p><strong>권장:</strong> 실제 프로젝트에서는 전용 이메일 검증 라이브러리 사용</p>
                        </div>
                    `,
                    interactive: {
                        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                        testText: 'user@example.com\ninvalid-email\ntest@site.org\n@incomplete.com\nuser@domain',
                        explanation: '완성된 이메일 검증 정규식입니다. 각 부분이 어떻게 이메일의 구성 요소와 매칭되는지 확인해보세요.'
                    },
                    practice: {
                        question: '한국 휴대폰 번호(010-1234-5678 형식)를 검증하는 정규식을 작성해보세요.',
                        answer: '^010-\\d{4}-\\d{4}$',
                        testText: '010-1234-5678\n02-123-4567\n010-12-5678\n010-1234-56789',
                        hint: '010으로 시작하고, 하이픈으로 구분된 4자리-4자리 숫자 패턴입니다.'
                    }
                }
            },
            12: {
                title: '축하합니다! 🎉',
                description: '정규식 기초 과정을 완료했습니다!',
                content: {
                    theory: `
                        <div class="congratulations">
                            <h2>🎉 축하합니다!</h2>
                            <p>정규식 기초 과정을 성공적으로 완료하셨습니다!</p>
                        </div>
                        
                        <div class="learned-concepts">
                            <h3>📚 배운 내용 정리</h3>
                            <div class="concepts-grid">
                                <div class="concept-item">
                                    <h4>리터럴 매칭</h4>
                                    <p>기본 문자 매칭과 이스케이프</p>
                                </div>
                                <div class="concept-item">
                                    <h4>문자 클래스</h4>
                                    <p>[abc], [a-z], [^abc] 패턴</p>
                                </div>
                                <div class="concept-item">
                                    <h4>수량자</h4>
                                    <p>*, +, ?, {n,m} 반복 표현</p>
                                </div>
                                <div class="concept-item">
                                    <h4>앵커</h4>
                                    <p>^, $ 위치 지정</p>
                                </div>
                                <div class="concept-item">
                                    <h4>와일드카드</h4>
                                    <p>. 임의 문자 매칭</p>
                                </div>
                                <div class="concept-item">
                                    <h4>단축 표현</h4>
                                    <p>\\d, \\w, \\s 문자 클래스</p>
                                </div>
                                <div class="concept-item">
                                    <h4>그룹</h4>
                                    <p>() 패턴 그룹화와 캡처</p>
                                </div>
                                <div class="concept-item">
                                    <h4>선택</h4>
                                    <p>| OR 연산</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="next-steps">
                            <h3>🚀 다음 단계</h3>
                            <div class="next-actions">
                                <div class="action-card">
                                    <h4><i class="fas fa-flask"></i> 테스터에서 연습</h4>
                                    <p>배운 패턴들을 자유롭게 테스트하고 실험해보세요.</p>
                                    <a href="./tester.html" class="btn btn-primary">테스터로 가기</a>
                                </div>
                                
                                <div class="action-card">
                                    <h4><i class="fas fa-book"></i> 패턴 라이브러리 탐색</h4>
                                    <p>더 많은 실용적인 정규식 패턴들을 살펴보세요.</p>
                                    <a href="./library.html" class="btn btn-secondary">라이브러리로 가기</a>
                                </div>
                                
                                <div class="action-card">
                                    <h4><i class="fas fa-graduation-cap"></i> 전문가 도구</h4>
                                    <p>고급 정규식 기능과 디버깅 도구를 사용해보세요.</p>
                                    <a href="./expert.html" class="btn btn-outline">전문가 도구</a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="quick-reference">
                            <h3>📋 빠른 참조표</h3>
                            <div class="reference-table">
                                <table class="reference">
                                    <tr><th>패턴</th><th>의미</th><th>예제</th></tr>
                                    <tr><td><code>.</code></td><td>임의의 문자</td><td><code>c.t</code> → cat, cut</td></tr>
                                    <tr><td><code>*</code></td><td>0개 이상</td><td><code>a*</code> → "", a, aa</td></tr>
                                    <tr><td><code>+</code></td><td>1개 이상</td><td><code>a+</code> → a, aa, aaa</td></tr>
                                    <tr><td><code>?</code></td><td>0개 또는 1개</td><td><code>a?</code> → "", a</td></tr>
                                    <tr><td><code>^</code></td><td>시작</td><td><code>^Hello</code></td></tr>
                                    <tr><td><code>$</code></td><td>끝</td><td><code>end$</code></td></tr>
                                    <tr><td><code>[abc]</code></td><td>a, b, c 중 하나</td><td><code>[aeiou]</code></td></tr>
                                    <tr><td><code>[^abc]</code></td><td>a, b, c가 아닌</td><td><code>[^0-9]</code></td></tr>
                                    <tr><td><code>\\d</code></td><td>숫자</td><td><code>[0-9]</code>와 같음</td></tr>
                                    <tr><td><code>\\w</code></td><td>단어 문자</td><td><code>[a-zA-Z0-9_]</code></td></tr>
                                    <tr><td><code>\\s</code></td><td>공백</td><td>스페이스, 탭, 줄바꿈</td></tr>
                                    <tr><td><code>()</code></td><td>그룹</td><td><code>(abc)+</code></td></tr>
                                    <tr><td><code>|</code></td><td>또는</td><td><code>cat|dog</code></td></tr>
                                </table>
                            </div>
                        </div>
                        
                        <div class="motivation">
                            <h3>🌟 마무리</h3>
                            <p>정규식은 처음에는 복잡해 보이지만, 한 번 익숙해지면 텍스트 처리의 <strong>강력한 도구</strong>가 됩니다.</p>
                            <p>계속 연습하고 실험하다 보면 더욱 복잡한 패턴도 자유자재로 다룰 수 있게 될 것입니다!</p>
                            <p><strong>행운을 빕니다! 🚀</strong></p>
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

    loadCurrentLesson() {
        const lesson = this.lessons[this.currentLesson];
        if (!lesson) return;

        this.displayLessonContent(lesson);
        this.setupInteractiveDemo(lesson.content.interactive);
        this.setupPractice(lesson.content.practice);
        this.updateNavigation();
        this.updateQuickNav();
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
                    <button id="try-it" class="btn btn-primary">
                        <i class="fas fa-play"></i> 실행
                    </button>
                    <button id="reset-demo" class="btn btn-outline">
                        <i class="fas fa-refresh"></i> 초기화
                    </button>
                </div>
            </div>
            
            <div class="demo-content">
                <div class="demo-pattern">
                    <label>정규식 패턴:</label>
                    <div class="pattern-display">
                        <code id="demo-pattern">${interactive.pattern}</code>
                    </div>
                </div>
                
                <div class="demo-text">
                    <label>테스트 텍스트:</label>
                    <div class="text-area">
                        <div id="demo-text">${interactive.testText}</div>
                    </div>
                </div>
                
                <div class="demo-result" id="demo-result"></div>
                
                <div class="demo-explanation">
                    <h4>📖 설명</h4>
                    <p>${interactive.explanation}</p>
                </div>
            </div>
        `;

        this.runInteractiveDemo();
    }

    runInteractiveDemo() {
        const patternEl = document.getElementById('demo-pattern');
        const textEl = document.getElementById('demo-text');
        const resultEl = document.getElementById('demo-result');

        if (!patternEl || !textEl || !resultEl) return;

        const pattern = patternEl.textContent;
        const text = textEl.textContent;

        try {
            const regex = new RegExp(pattern, 'g');
            const matches = [...text.matchAll(regex)];

            if (matches.length > 0) {
                // Highlight matches
                let highlightedText = text;
                let offset = 0;

                matches.forEach((match, index) => {
                    const start = match.index + offset;
                    const end = start + match[0].length;
                    const matchText = highlightedText.slice(start, end);
                    
                    const highlighted = `<mark class="demo-highlight" title="매칭 #${index + 1}">${matchText}</mark>`;
                    
                    highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
                    offset += highlighted.length - matchText.length;
                });

                textEl.innerHTML = highlightedText;
                resultEl.innerHTML = `
                    <div class="demo-success">
                        <i class="fas fa-check-circle"></i>
                        <strong>${matches.length}개의 매칭을 찾았습니다!</strong>
                    </div>
                `;
            } else {
                resultEl.innerHTML = `
                    <div class="demo-no-match">
                        <i class="fas fa-info-circle"></i>
                        매칭된 결과가 없습니다.
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
                <button id="show-hint" class="btn btn-sm btn-outline">
                    <i class="fas fa-lightbulb"></i> 힌트
                </button>
            </div>
            
            <div class="practice-content">
                <div class="practice-question">
                    <h4>문제</h4>
                    <p>${practice.question}</p>
                </div>
                
                <div class="practice-input-group">
                    <label for="practice-input">정규식을 입력하세요:</label>
                    <input type="text" id="practice-input" class="practice-input" 
                           placeholder="여기에 정규식을 작성하세요...">
                </div>
                
                <div class="practice-test-area">
                    <label>테스트 텍스트:</label>
                    <div class="test-text">${practice.testText}</div>
                </div>
                
                <div class="practice-controls">
                    <button id="check-answer" class="btn btn-primary">
                        <i class="fas fa-check"></i> 답 확인
                    </button>
                </div>
                
                <div id="practice-result" class="practice-result"></div>
                <div id="practice-hint" class="practice-hint" style="display: none;">
                    <i class="fas fa-lightbulb"></i>
                    <strong>힌트:</strong> ${practice.hint}
                </div>
            </div>
        `;

        this.bindPracticeEvents();
    }

    bindPracticeEvents() {
        const input = document.getElementById('practice-input');
        const checkBtn = document.getElementById('check-answer');
        const hintBtn = document.getElementById('show-hint');

        input?.addEventListener('input', () => this.updatePracticePreview());
        checkBtn?.addEventListener('click', () => this.checkPracticeAnswer());
        hintBtn?.addEventListener('click', () => this.showHint());
    }

    updatePracticePreview() {
        const input = document.getElementById('practice-input');
        const testText = document.querySelector('.test-text');
        
        if (!input || !testText) return;

        const pattern = input.value;
        if (!pattern) {
            testText.innerHTML = this.lessons[this.currentLesson].content.practice.testText;
            return;
        }

        try {
            const regex = new RegExp(pattern, 'g');
            const text = this.lessons[this.currentLesson].content.practice.testText;
            const matches = [...text.matchAll(regex)];

            if (matches.length > 0) {
                let highlightedText = text;
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
                testText.innerHTML = text;
            }
        } catch (error) {
            testText.innerHTML = this.lessons[this.currentLesson].content.practice.testText;
        }
    }

    checkPracticeAnswer() {
        const input = document.getElementById('practice-input');
        const result = document.getElementById('practice-result');
        
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
                            <button onclick="beginnerTool.goToNextLesson()" class="btn btn-primary">
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
        const hint = document.getElementById('practice-hint');
        if (hint) {
            hint.style.display = hint.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Navigation methods
    goToNextLesson() {
        if (this.currentLesson < this.totalLessons) {
            this.currentLesson++;
            this.loadCurrentLesson();
            this.saveProgress();
        }
    }

    goToPreviousLesson() {
        if (this.currentLesson > 1) {
            this.currentLesson--;
            this.loadCurrentLesson();
            this.saveProgress();
        }
    }

    goToLesson(lessonNumber) {
        if (lessonNumber >= 1 && lessonNumber <= this.totalLessons) {
            this.currentLesson = lessonNumber;
            this.loadCurrentLesson();
            this.saveProgress();
        }
    }

    updateNavigation() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentLesson === 1;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentLesson === this.totalLessons;
        }

        if (this.lessonSelect) {
            this.lessonSelect.value = this.currentLesson;
        }
    }

    updateQuickNav() {
        if (this.currentIndicator) {
            this.currentIndicator.textContent = this.currentLesson.toString();
        }
        
        if (this.prevQuickBtn) {
            this.prevQuickBtn.disabled = this.currentLesson === 1;
        }
        
        if (this.nextQuickBtn) {
            this.nextQuickBtn.disabled = this.currentLesson === this.totalLessons;
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
        this.tocItems.forEach((item, index) => {
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
            '와일드카드의 매력을 알게 되었네요! 🃏',
            '단축 표현으로 더 간결해졌어요! ⚡',
            '그룹화의 위력을 체험했습니다! 🎯',
            '선택의 자유를 얻었어요! 🔄',
            '실전 실력이 늘었습니다! 🚀',
            '축하합니다! 정규식 마스터가 되었어요! 🏆'
        ];

        const message = messages[lessonNumber - 1] || '레슨 완료!';
        this.showNotification(message, 'success', 2000);
    }

    // Data persistence
    loadProgress() {
        try {
            const saved = localStorage.getItem('beginnerProgress');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
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

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Arrow keys for navigation
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.goToPreviousLesson();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.goToNextLesson();
        }
        
        // Enter to check answer
        if (e.key === 'Enter' && e.target.id === 'practice-input') {
            e.preventDefault();
            this.checkPracticeAnswer();
        }
        
        // F1 for hint
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHint();
        }
    }

    // Utility methods
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} beginner-notification`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.beginnerTool = new RegexBeginner();
    console.log('🎓 NEO Regex Beginner Guide initialized!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexBeginner };
}