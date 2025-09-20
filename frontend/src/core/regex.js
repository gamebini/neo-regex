// frontend/src/core/regex.js
/**
 * NEO Regex 핵심 정규식 처리 모듈
 */

export class RegexTester {
  constructor() {
    this.pattern = '';
    this.flags = '';
    this.testText = '';
    this.lastResult = null;
  }

  /**
   * 정규식 패턴 설정
   */
  setPattern(pattern, flags = '') {
    this.pattern = pattern;
    this.flags = flags;
    return this;
  }

  /**
   * 테스트 텍스트 설정
   */
  setText(text) {
    this.testText = text;
    return this;
  }

  /**
   * 정규식 테스트 실행
   */
  test() {
    try {
      if (!this.pattern) {
        throw new Error('정규식 패턴이 비어있습니다.');
      }

      const regex = new RegExp(this.pattern, this.flags);
      const startTime = performance.now();
      
      let matches = [];
      if (this.flags.includes('g')) {
        matches = [...this.testText.matchAll(regex)];
      } else {
        const match = this.testText.match(regex);
        if (match) matches = [match];
      }
      
      const endTime = performance.now();
      
      this.lastResult = {
        success: true,
        pattern: this.pattern,
        flags: this.flags,
        text: this.testText,
        matches: matches.map(match => ({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1),
          namedGroups: match.groups || {}
        })),
        totalMatches: matches.length,
        executionTime: endTime - startTime,
        timestamp: new Date().toISOString()
      };

      return this.lastResult;
    } catch (error) {
      this.lastResult = {
        success: false,
        error: error.message,
        pattern: this.pattern,
        flags: this.flags,
        text: this.testText,
        timestamp: new Date().toISOString()
      };
      
      return this.lastResult;
    }
  }

  /**
   * 정규식 문법 검증
   */
  validate() {
    try {
      new RegExp(this.pattern, this.flags);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        suggestions: this.getSuggestions(error.message)
      };
    }
  }

  /**
   * 오류에 대한 제안사항 제공
   */
  getSuggestions(errorMessage) {
    const suggestions = [];
    
    if (errorMessage.includes('Unterminated character class')) {
      suggestions.push('문자 클래스 ]가 누락되었습니다. [abc] 형태로 닫아주세요.');
    }
    
    if (errorMessage.includes('Unterminated group')) {
      suggestions.push('그룹 )이 누락되었습니다. (abc) 형태로 닫아주세요.');
    }
    
    if (errorMessage.includes('Invalid escape sequence')) {
      suggestions.push('잘못된 이스케이프 시퀀스입니다. \\를 두 번 사용하거나 올바른 이스케이프를 사용하세요.');
    }
    
    return suggestions;
  }

  /**
   * 결과를 HTML로 하이라이트
   */
  highlightMatches() {
    if (!this.lastResult || !this.lastResult.success) {
      return this.testText;
    }

    let highlightedText = this.testText;
    const matches = this.lastResult.matches;
    
    // 뒤에서부터 처리하여 인덱스 변화 방지
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const before = highlightedText.substring(0, match.index);
      const matchText = highlightedText.substring(match.index, match.index + match.length);
      const after = highlightedText.substring(match.index + match.length);
      
      highlightedText = before + 
        `<mark class="match-highlight" data-match="${i}">${matchText}</mark>` + 
        after;
    }
    
    return highlightedText;
  }
}

export class PatternLibrary {
  constructor() {
    this.patterns = this.getDefaultPatterns();
  }

  /**
   * 기본 패턴 라이브러리
   */
  getDefaultPatterns() {
    return [
      {
        id: 'email',
        title: '이메일 주소',
        pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        flags: '',
        description: '일반적인 이메일 주소 형식을 검증합니다.',
        category: 'validation',
        tags: ['이메일', 'email', '검증'],
        examples: {
          valid: ['user@example.com', 'test.email@domain.org', 'user123@test-site.co.kr'],
          invalid: ['invalid-email', 'user@', '@domain.com', 'user@domain']
        }
      },
      {
        id: 'phone-kr',
        title: '한국 전화번호',
        pattern: '01[016789]-?\\d{3,4}-?\\d{4}',
        flags: '',
        description: '한국의 휴대폰 번호 형식을 검증합니다.',
        category: 'validation',
        tags: ['전화번호', 'phone', '한국', '휴대폰'],
        examples: {
          valid: ['010-1234-5678', '01012345678', '011-123-4567', '016-1234-5678'],
          invalid: ['010-12-345', '02-1234-5678', '010-1234-567', '010-12345-678']
        }
      },
      {
        id: 'url',
        title: 'URL',
        pattern: 'https?://[^\\s]+',
        flags: 'g',
        description: 'HTTP/HTTPS URL을 매칭합니다.',
        category: 'web',
        tags: ['URL', 'http', 'https', '웹주소'],
        examples: {
          valid: ['https://example.com', 'http://test.org/path?param=value', 'https://subdomain.example.com/'],
          invalid: ['ftp://example.com', 'invalid-url', 'https://', 'www.example.com']
        }
      },
      {
        id: 'password-strong',
        title: '강력한 비밀번호',
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
        flags: '',
        description: '최소 8자, 대소문자, 숫자, 특수문자를 포함한 강력한 비밀번호',
        category: 'security',
        tags: ['비밀번호', 'password', '보안', 'security'],
        examples: {
          valid: ['MyPass123!', 'SecureP@ss1', 'Str0ng&Pass'],
          invalid: ['password', '12345678', 'Password', 'MyPass123']
        }
      },
      {
        id: 'korean-name',
        title: '한국 이름',
        pattern: '^[가-힣]{2,4}$',
        flags: '',
        description: '한글로 된 2-4자 이름을 매칭합니다.',
        category: 'korean',
        tags: ['한글', '이름', '한국어'],
        examples: {
          valid: ['김철수', '이영희', '박', '황보석대'],
          invalid: ['kim', '김철수123', '김 철수', '가나다라마']
        }
      }
    ];
  }

  /**
   * 패턴 검색
   */
  search(query) {
    if (!query) return this.patterns;
    
    const searchTerm = query.toLowerCase();
    return this.patterns.filter(pattern => 
      pattern.title.toLowerCase().includes(searchTerm) ||
      pattern.description.toLowerCase().includes(searchTerm) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * 카테고리별 패턴 가져오기
   */
  getByCategory(category) {
    return this.patterns.filter(pattern => pattern.category === category);
  }

  /**
   * ID로 패턴 가져오기
   */
  getById(id) {
    return this.patterns.find(pattern => pattern.id === id);
  }

  /**
   * 사용자 정의 패턴 추가
   */
  addCustomPattern(pattern) {
    const customPattern = {
      ...pattern,
      id: `custom_${Date.now()}`,
      category: pattern.category || 'custom'
    };
    
    this.patterns.push(customPattern);
    this.saveToStorage();
    return customPattern;
  }

  /**
   * 로컬 스토리지에 저장
   */
  saveToStorage() {
    try {
      const customPatterns = this.patterns.filter(p => p.id.startsWith('custom_'));
      localStorage.setItem('neo-regex-custom-patterns', JSON.stringify(customPatterns));
    } catch (error) {
      console.error('패턴 저장 실패:', error);
    }
  }

  /**
   * 로컬 스토리지에서 로드
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('neo-regex-custom-patterns');
      if (stored) {
        const customPatterns = JSON.parse(stored);
        this.patterns.push(...customPatterns);
      }
    } catch (error) {
      console.error('패턴 로드 실패:', error);
    }
  }
}

// 전역 인스턴스 생성
export const regexTester = new RegexTester();
export const patternLibrary = new PatternLibrary();

// 초기화
patternLibrary.loadFromStorage();