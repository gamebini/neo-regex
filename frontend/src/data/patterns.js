/**
 * NEO Regex - Pattern Data
 * 검증된 정규식 패턴 데이터베이스
 * 경로: src/data/patterns.js
 */

// =========================
// Pattern Database
// =========================
window.RegexPatterns = [
  // =========================
  // 기본 패턴 (Basic Patterns)
  // =========================
  {
    id: 'email_basic',
    title: '이메일 주소 (기본)',
    category: 'basic',
    difficulty: 'beginner',
    description: '일반적인 이메일 주소 형식을 검증합니다. 대부분의 상황에서 사용할 수 있는 기본적인 패턴입니다.',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: '',
    explanation: '이메일 형식의 기본적인 검증 패턴입니다. 로컬 부분(@앞)에는 영문자, 숫자, 특수문자를 허용하고, 도메인 부분(@뒤)에는 영문자, 숫자, 하이픈, 점을 허용합니다.',
    examples: {
      valid: ['user@example.com', 'test.email@domain.org', 'user.name+tag@example.com', 'user123@test-domain.co.kr'],
      invalid: ['invalid-email', 'user@', '@domain.com', 'user..name@domain.com', 'user@domain', 'user name@domain.com']
    },
    tags: ['이메일', 'email', '검증', '기본', 'validation'],
    usage_count: 15420,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'email_strict',
    title: '이메일 주소 (엄격)',
    category: 'validation',
    difficulty: 'intermediate',
    description: 'RFC 5322 표준에 더 가까운 엄격한 이메일 검증 패턴입니다.',
    pattern: '^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$',
    flags: '',
    explanation: '더 엄격한 이메일 검증 패턴으로, 연속된 점이나 하이픈을 방지하고 RFC 표준에 더 가깝게 검증합니다.',
    examples: {
      valid: ['user@example.com', 'test.email@domain.org', 'user123@sub.domain.com'],
      invalid: ['user..name@domain.com', 'user@domain..com', '.user@domain.com', 'user.@domain.com']
    },
    tags: ['이메일', 'email', '엄격', 'RFC', 'validation'],
    usage_count: 8943,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'phone_korean',
    title: '한국 전화번호',
    category: 'korean',
    difficulty: 'beginner',
    description: '한국의 휴대폰 번호와 일반 전화번호를 검증합니다. 하이픈 있음/없음 모두 지원합니다.',
    pattern: '^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$',
    flags: '',
    explanation: '한국의 휴대폰(010, 011, 016, 017, 018, 019)과 지역번호(02, 031-09X)를 포함한 일반 전화번호를 매칭합니다. 하이픈은 선택사항입니다.',
    examples: {
      valid: ['010-1234-5678', '02-123-4567', '031-123-4567', '01012345678', '0212345678'],
      invalid: ['010-123-456', '020-1234-5678', '010-12-5678', '1234-5678', '010-1234-56789']
    },
    tags: ['전화번호', 'phone', '한국', '휴대폰', '지역번호'],
    usage_count: 12890,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'phone_international',
    title: '국제 전화번호',
    category: 'basic',
    difficulty: 'intermediate',
    description: '국제 형식의 전화번호를 검증합니다. +로 시작하는 국가 코드를 포함합니다.',
    pattern: '^\\+[1-9]\\d{1,14}$',
    flags: '',
    explanation: 'ITU-T E.164 표준에 따른 국제 전화번호 형식입니다. +와 국가 코드로 시작하며 최대 15자리까지 허용합니다.',
    examples: {
      valid: ['+82-10-1234-5678', '+1-555-123-4567', '+44-20-7946-0958', '+86-138-0013-8000'],
      invalid: ['+0-123-456-7890', '82-10-1234-5678', '+123456789012345678', '+12']
    },
    tags: ['전화번호', 'phone', '국제', 'international', 'E.164'],
    usage_count: 6754,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'url_http',
    title: 'URL 주소',
    category: 'web',
    difficulty: 'intermediate',
    description: 'HTTP, HTTPS 프로토콜을 사용하는 URL 주소를 검증합니다.',
    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    flags: '',
    explanation: 'HTTP 또는 HTTPS 프로토콜을 사용하는 URL을 검증합니다. 선택적으로 www 서브도메인을 포함할 수 있으며, 경로와 쿼리 파라미터도 허용합니다.',
    examples: {
      valid: ['https://www.example.com', 'http://example.com/path', 'https://sub.domain.com/path?query=1', 'https://api.service.com/v1/users/123'],
      invalid: ['www.example.com', 'example', 'ftp://example.com', 'https://', 'http://space in url.com']
    },
    tags: ['URL', 'HTTP', 'HTTPS', '웹주소', 'web'],
    usage_count: 9876,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'url_complete',
    title: 'URL 주소 (완전)',
    category: 'web',
    difficulty: 'advanced',
    description: '더 포괄적인 URL 검증 패턴으로 다양한 프로토콜과 형식을 지원합니다.',
    pattern: '^(https?|ftp|ssh):\\/\\/(([^\\s@]+@)?([^\\s@:]+)(:[0-9]+)?)\\/?(([^\\s?#]*)(\\?[^\\s#]*)?(#[^\\s]*)?)$',
    flags: '',
    explanation: 'HTTP, HTTPS, FTP, SSH 프로토콜을 지원하며, 사용자 인증 정보, 포트 번호, 경로, 쿼리, 프래그먼트를 모두 포함하는 완전한 URL 패턴입니다.',
    examples: {
      valid: ['https://user:pass@example.com:8080/path?query=value#section', 'ftp://files.example.com/file.txt', 'ssh://user@server.com:22/path'],
      invalid: ['invalid://example.com', 'https://example .com', 'http://', 'https://example.com space']
    },
    tags: ['URL', 'complete', '완전', 'protocol', 'advanced'],
    usage_count: 4321,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'ip_address_v4',
    title: 'IP 주소 (IPv4)',
    category: 'development',
    difficulty: 'intermediate',
    description: 'IPv4 형식의 IP 주소를 검증합니다. 0.0.0.0부터 255.255.255.255까지 유효합니다.',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: '',
    explanation: '각 옥텟이 0-255 범위 내의 숫자인지 검증하는 IPv4 주소 패턴입니다. 선행 0은 허용하지 않습니다.',
    examples: {
      valid: ['192.168.1.1', '127.0.0.1', '255.255.255.255', '0.0.0.0', '10.0.0.1'],
      invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1', '192.168.01.1', '192.168.-1.1']
    },
    tags: ['IP', 'IPv4', '네트워크', 'network', '개발'],
    usage_count: 7654,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'ip_address_v6',
    title: 'IP 주소 (IPv6)',
    category: 'development',
    difficulty: 'advanced',
    description: 'IPv6 형식의 IP 주소를 검증합니다. 완전 형식과 압축 형식을 모두 지원합니다.',
    pattern: '^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$',
    flags: '',
    explanation: 'IPv6 주소의 다양한 형식을 지원합니다. 완전 형식, 압축 형식(::), IPv4 매핑 주소 등을 모두 검증할 수 있습니다.',
    examples: {
      valid: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', '2001:db8:85a3::8a2e:370:7334', '::1', '::ffff:192.168.1.1'],
      invalid: ['2001:0db8:85a3::8a2e::7334', '2001:0db8:85a3:0000:0000:8a2e:0370:7334:extra', 'invalid::address']
    },
    tags: ['IP', 'IPv6', '네트워크', 'network', '고급'],
    usage_count: 2341,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 검증 패턴 (Validation Patterns)
  // =========================
  {
    id: 'password_strong',
    title: '강력한 비밀번호',
    category: 'security',
    difficulty: 'advanced',
    description: '대소문자, 숫자, 특수문자를 포함한 8자 이상의 강력한 비밀번호를 검증합니다.',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    explanation: '최소 8자 이상이며, 소문자, 대문자, 숫자, 특수문자(@$!%*?&)를 각각 최소 1개씩 포함해야 합니다. 미리보기 어설션을 사용하여 각 조건을 검증합니다.',
    examples: {
      valid: ['Password123!', 'MyStr0ng@Pass', 'Secure$Pass1', 'Complex&789'],
      invalid: ['password', 'PASSWORD123', 'Pass123', 'Password!', 'Pas123!', 'password123!', 'PASSWORD123!']
    },
    tags: ['비밀번호', 'password', '보안', 'security', '검증'],
    usage_count: 8765,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'password_medium',
    title: '중간 강도 비밀번호',
    category: 'security',
    difficulty: 'intermediate',
    description: '6자 이상이며 영문자와 숫자를 포함하는 중간 강도의 비밀번호를 검증합니다.',
    pattern: '^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{6,}$',
    flags: '',
    explanation: '최소 6자 이상이며, 영문자와 숫자를 각각 최소 1개씩 포함해야 합니다. 특수문자는 선택사항입니다.',
    examples: {
      valid: ['Pass123', 'mypass1', 'Test456', 'secure2'],
      invalid: ['password', '123456', 'Pass', '12345']
    },
    tags: ['비밀번호', 'password', '중간', 'medium', '검증'],
    usage_count: 5432,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'credit_card',
    title: '신용카드 번호',
    category: 'validation',
    difficulty: 'intermediate',
    description: '주요 신용카드 회사의 카드 번호 형식을 검증합니다.',
    pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
    flags: '',
    explanation: 'Visa(4로 시작), MasterCard(51-55로 시작), American Express(34, 37로 시작), Discover(6011, 65로 시작) 등의 카드 번호 형식을 검증합니다.',
    examples: {
      valid: ['4111111111111111', '5555555555554444', '378282246310005', '6011111111111117'],
      invalid: ['1234567890123456', '4111-1111-1111-1111', '411111111111111', '7111111111111111']
    },
    tags: ['신용카드', 'credit card', '결제', 'payment', '검증'],
    usage_count: 3456,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'korean_name',
    title: '한국 이름',
    category: 'korean',
    difficulty: 'beginner',
    description: '한국어 성명을 검증합니다. 2-4글자의 한글 이름을 허용합니다.',
    pattern: '^[가-힣]{2,4}$',
    flags: '',
    explanation: '한글 완성형 문자(가-힣)로만 구성된 2-4글자의 이름을 매칭합니다. 성과 이름을 구분하지 않고 전체 이름을 검증합니다.',
    examples: {
      valid: ['김철수', '이영희', '박지성', '홍길동'],
      invalid: ['김', '김철수철수철', 'kim', '김철수123', '김 철수']
    },
    tags: ['한국어', '이름', 'korean', 'name', '한글'],
    usage_count: 6789,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'korean_postal_code',
    title: '한국 우편번호',
    category: 'korean',
    difficulty: 'beginner',
    description: '한국의 5자리 우편번호를 검증합니다.',
    pattern: '^[0-9]{5}$',
    flags: '',
    explanation: '2015년부터 사용되는 5자리 우편번호 형식을 검증합니다. 모든 숫자로 구성되어야 합니다.',
    examples: {
      valid: ['12345', '06234', '13579', '00000'],
      invalid: ['123-456', '1234', '123456', 'abcde', '12 345']
    },
    tags: ['우편번호', 'postal code', '한국', 'korean', '주소'],
    usage_count: 4567,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 웹 패턴 (Web Patterns)
  // =========================
  {
    id: 'html_tag',
    title: 'HTML 태그',
    category: 'web',
    difficulty: 'intermediate',
    description: 'HTML 태그를 매칭합니다. 열림 태그와 닫힘 태그를 모두 지원합니다.',
    pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*\\b[^>]*>',
    flags: 'g',
    explanation: 'HTML 태그를 매칭하는 패턴입니다. 태그명, 속성, 자체 종료 태그 등을 모두 지원합니다.',
    examples: {
      valid: ['<div>', '</div>', '<img src="test.jpg" alt="test">', '<br/>', '<input type="text" />'],
      invalid: ['<>', '<123>', '<div', 'div>', '< div>']
    },
    tags: ['HTML', 'tag', '웹', 'web', 'markup'],
    usage_count: 5678,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'css_color_hex',
    title: 'CSS 색상 코드 (HEX)',
    category: 'web',
    difficulty: 'beginner',
    description: 'CSS에서 사용하는 16진수 색상 코드를 검증합니다.',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    flags: '',
    explanation: '#으로 시작하는 3자리 또는 6자리 16진수 색상 코드를 매칭합니다. 대소문자를 구분하지 않습니다.',
    examples: {
      valid: ['#FF0000', '#ff0000', '#F00', '#abc', '#123456'],
      invalid: ['FF0000', '#GG0000', '#12', '#1234567', 'red']
    },
    tags: ['CSS', 'color', '색상', 'hex', '웹'],
    usage_count: 4321,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'css_selector',
    title: 'CSS 선택자',
    category: 'web',
    difficulty: 'advanced',
    description: '기본적인 CSS 선택자 패턴을 매칭합니다.',
    pattern: '^[a-zA-Z][a-zA-Z0-9]*|\\.[a-zA-Z][a-zA-Z0-9_-]*|#[a-zA-Z][a-zA-Z0-9_-]*$',
    flags: '',
    explanation: '태그 선택자, 클래스 선택자(.class), ID 선택자(#id) 등의 기본적인 CSS 선택자를 매칭합니다.',
    examples: {
      valid: ['div', '.container', '#header', '.nav-menu', '#main-content'],
      invalid: ['.123', '#-invalid', '..double', '##double', ' .space']
    },
    tags: ['CSS', 'selector', '선택자', '웹', 'web'],
    usage_count: 3210,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 데이터 패턴 (Data Patterns)
  // =========================
  {
    id: 'date_iso',
    title: '날짜 (ISO 8601)',
    category: 'data',
    difficulty: 'intermediate',
    description: 'ISO 8601 표준 형식의 날짜를 검증합니다 (YYYY-MM-DD).',
    pattern: '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$',
    flags: '',
    explanation: 'YYYY-MM-DD 형식의 날짜를 검증합니다. 년도는 4자리, 월은 01-12, 일은 01-31 범위를 허용합니다.',
    examples: {
      valid: ['2024-01-01', '2023-12-31', '2024-02-29', '2024-06-15'],
      invalid: ['24-01-01', '2024-13-01', '2024-01-32', '2024/01/01', '2024-1-1']
    },
    tags: ['날짜', 'date', 'ISO', '8601', 'format'],
    usage_count: 7890,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'date_korean',
    title: '날짜 (한국 형식)',
    category: 'korean',
    difficulty: 'beginner',
    description: '한국에서 자주 사용하는 날짜 형식을 검증합니다.',
    pattern: '^\\d{4}[.\\/\\-](0[1-9]|1[0-2])[.\\/\\-](0[1-9]|[12]\\d|3[01])$',
    flags: '',
    explanation: 'YYYY.MM.DD, YYYY/MM/DD, YYYY-MM-DD 형식의 날짜를 모두 허용합니다. 구분자로 점, 슬래시, 하이픈을 사용할 수 있습니다.',
    examples: {
      valid: ['2024.01.01', '2024/01/01', '2024-01-01', '2023.12.31'],
      invalid: ['24.01.01', '2024.13.01', '2024.01.32', '2024 01 01']
    },
    tags: ['날짜', 'date', '한국', 'korean', 'format'],
    usage_count: 5432,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'time_24h',
    title: '시간 (24시간)',
    category: 'data',
    difficulty: 'beginner',
    description: '24시간 형식의 시간을 검증합니다 (HH:MM).',
    pattern: '^(?:[01]\\d|2[0-3]):[0-5]\\d$',
    flags: '',
    explanation: '00:00부터 23:59까지의 24시간 형식 시간을 검증합니다. 시간은 00-23, 분은 00-59 범위를 허용합니다.',
    examples: {
      valid: ['00:00', '12:30', '23:59', '09:15'],
      invalid: ['24:00', '12:60', '9:15', '12:5', '25:30']
    },
    tags: ['시간', 'time', '24시간', 'format'],
    usage_count: 3456,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'number_integer',
    title: '정수',
    category: 'data',
    difficulty: 'beginner',
    description: '양수, 음수, 0을 포함한 정수를 매칭합니다.',
    pattern: '^-?\\d+$',
    flags: '',
    explanation: '선택적인 음수 부호(-)와 하나 이상의 숫자로 구성된 정수를 매칭합니다.',
    examples: {
      valid: ['123', '-456', '0', '999999'],
      invalid: ['12.3', '12a', '', '+123', '12 3']
    },
    tags: ['숫자', 'number', '정수', 'integer', 'data'],
    usage_count: 6543,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'number_decimal',
    title: '소수',
    category: 'data',
    difficulty: 'intermediate',
    description: '소수점을 포함한 실수를 매칭합니다.',
    pattern: '^-?\\d+(\\.\\d+)?',
    flags: '',
    explanation: '정수 부분과 선택적인 소수 부분으로 구성된 실수를 매칭합니다. 음수도 허용합니다.',
    examples: {
      valid: ['123.45', '-456.78', '0.123', '999', '-0.001'],
      invalid: ['12.', '.123', '12.34.56', '12.3a', '']
    },
    tags: ['숫자', 'number', '소수', 'decimal', 'float'],
    usage_count: 4321,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'json_string',
    title: 'JSON 문자열',
    category: 'development',
    difficulty: 'advanced',
    description: 'JSON 형식의 문자열을 매칭합니다.',
    pattern: '^"(\\\\.|[^"\\\\])*"',
    flags: '',
    explanation: '큰따옴표로 둘러싸인 JSON 문자열을 매칭합니다. 이스케이프 문자도 올바르게 처리합니다.',
    examples: {
      valid: ['"hello"', '"hello world"', '"escaped \\"quote\\""', '"unicode \\u0041"'],
      invalid: ["'hello'", '"unclosed string', '"invalid \\x escape"', 'hello']
    },
    tags: ['JSON', 'string', '문자열', 'development'],
    usage_count: 2345,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 개발자 패턴 (Development Patterns)
  // =========================
  {
    id: 'variable_name_js',
    title: 'JavaScript 변수명',
    category: 'development',
    difficulty: 'intermediate',
    description: 'JavaScript에서 유효한 변수명을 검증합니다.',
    pattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*',
    flags: '',
    explanation: 'JavaScript 변수명 규칙에 따라 영문자, 밑줄, 달러 기호로 시작하고, 이후에는 숫자도 포함할 수 있습니다.',
    examples: {
      valid: ['myVariable', '_private', '$jquery', 'userName123', '__proto__'],
      invalid: ['123abc', 'my-variable', 'var with space', 'class', 'function']
    },
    tags: ['JavaScript', 'variable', '변수명', 'identifier'],
    usage_count: 5678,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'sql_injection',
    title: 'SQL 인젝션 감지',
    category: 'security',
    difficulty: 'advanced',
    description: 'SQL 인젝션 공격 패턴을 감지합니다.',
    pattern: '(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript)',
    flags: 'i',
    explanation: 'SQL 인젝션에 자주 사용되는 키워드들을 감지합니다. 대소문자를 구분하지 않습니다.',
    examples: {
      valid: [], // 이 패턴은 위험한 입력을 감지하는 용도
      invalid: ['SELECT * FROM users', "'; DROP TABLE users; --", 'UNION SELECT password', 'exec xp_cmdshell']
    },
    tags: ['SQL', 'injection', '보안', 'security', '공격'],
    usage_count: 1234,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'version_semantic',
    title: '시맨틱 버전',
    category: 'development',
    difficulty: 'intermediate',
    description: '시맨틱 버저닝(SemVer) 형식의 버전 번호를 검증합니다.',
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?',
    flags: '',
    explanation: 'MAJOR.MINOR.PATCH 형식의 시맨틱 버전을 검증합니다. 선택적으로 pre-release와 build metadata도 지원합니다.',
    examples: {
      valid: ['1.0.0', '1.2.3', '1.0.0-alpha', '1.0.0-alpha.1', '1.0.0+20130313144700'],
      invalid: ['1.0', '1.0.0.0', '01.0.0', '1.0.0-', '1.0.0+']
    },
    tags: ['version', '버전', 'semver', 'semantic', 'development'],
    usage_count: 3456,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'mac_address',
    title: 'MAC 주소',
    category: 'development',
    difficulty: 'intermediate',
    description: 'MAC(Media Access Control) 주소를 검증합니다.',
    pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})',
    flags: '',
    explanation: 'MAC 주소의 표준 형식을 검증합니다. 콜론(:) 또는 하이픈(-)으로 구분된 6개의 16진수 쌍을 허용합니다.',
    examples: {
      valid: ['00:1B:44:11:3A:B7', '00-1B-44-11-3A-B7', 'FF:FF:FF:FF:FF:FF'],
      invalid: ['00:1B:44:11:3A', '00:1B:44:11:3A:B7:C8', '00:1G:44:11:3A:B7', '001B44113AB7']
    },
    tags: ['MAC', 'address', '네트워크', 'network', 'hardware'],
    usage_count: 2345,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'uuid',
    title: 'UUID (v4)',
    category: 'development',
    difficulty: 'intermediate',
    description: 'UUID v4 형식의 고유 식별자를 검증합니다.',
    pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: '',
    explanation: 'UUID v4 형식을 검증합니다. 8-4-4-4-12 자리의 16진수로 구성되며, 버전 비트와 변형 비트가 올바른지 확인합니다.',
    examples: {
      valid: ['550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'],
      invalid: ['550e8400-e29b-21d4-a716-446655440000', '550e8400-e29b-41d4-a716', 'not-a-uuid']
    },
    tags: ['UUID', 'GUID', 'identifier', '식별자', 'unique'],
    usage_count: 1876,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 보안 패턴 (Security Patterns)
  // =========================
  {
    id: 'xss_detection',
    title: 'XSS 공격 감지',
    category: 'security',
    difficulty: 'advanced',
    description: 'Cross-Site Scripting(XSS) 공격 패턴을 감지합니다.',
    pattern: '(?i)<script[^>]*>.*?</script>|javascript:|on\\w+\\s*=|<iframe[^>]*>|<object[^>]*>|<embed[^>]*>',
    flags: 'i',
    explanation: 'XSS 공격에 자주 사용되는 스크립트 태그, 이벤트 핸들러, iframe 등의 패턴을 감지합니다.',
    examples: {
      valid: [], // 이 패턴은 위험한 입력을 감지하는 용도
      invalid: ['<script>alert("xss")</script>', 'javascript:alert(1)', '<img onerror="alert(1)" src="x">']
    },
    tags: ['XSS', 'security', '보안', 'script', 'attack'],
    usage_count: 987,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'password_common',
    title: '일반적인 비밀번호 감지',
    category: 'security',
    difficulty: 'beginner',
    description: '취약한 일반적인 비밀번호 패턴을 감지합니다.',
    pattern: '^(password|123456|qwerty|abc123|admin|root|guest|test|user)',
    flags: 'i',
    explanation: '자주 사용되는 취약한 비밀번호들을 감지합니다. 이러한 비밀번호는 사용을 금지해야 합니다.',
    examples: {
      valid: [], // 이 패턴은 취약한 비밀번호를 감지하는 용도
      invalid: ['password', '123456', 'qwerty', 'admin', 'Password']
    },
    tags: ['password', '비밀번호', 'weak', '취약', 'common'],
    usage_count: 1543,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 한국어 패턴 (Korean Patterns)
  // =========================
  {
    id: 'korean_only',
    title: '한글만',
    category: 'korean',
    difficulty: 'beginner',
    description: '한글 문자만으로 구성된 텍스트를 매칭합니다.',
    pattern: '^[가-힣\\s]+',
    flags: '',
    explanation: '한글 완성형 문자(가-힣)와 공백으로만 구성된 텍스트를 매칭합니다.',
    examples: {
      valid: ['안녕하세요', '한글 텍스트', '정규식 패턴'],
      invalid: ['Hello', '안녕123', '한글English', '안녕!']
    },
    tags: ['한글', 'korean', '한국어', 'hangul'],
    usage_count: 4567,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'korean_mixed',
    title: '한글+영문+숫자',
    category: 'korean',
    difficulty: 'beginner',
    description: '한글, 영문, 숫자가 혼합된 텍스트를 매칭합니다.',
    pattern: '^[가-힣a-zA-Z0-9\\s]+',
    flags: '',
    explanation: '한글, 영문자, 숫자, 공백으로 구성된 텍스트를 매칭합니다. 특수문자는 허용하지 않습니다.',
    examples: {
      valid: ['안녕 Hello 123', '제품명 Product1', '사용자 User123'],
      invalid: ['안녕!', 'Hello@World', '제품-명']
    },
    tags: ['한글', 'korean', '영문', '숫자', 'mixed'],
    usage_count: 3456,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'korean_business_number',
    title: '사업자등록번호',
    category: 'korean',
    difficulty: 'intermediate',
    description: '한국의 사업자등록번호 형식을 검증합니다.',
    pattern: '^[0-9]{3}-?[0-9]{2}-?[0-9]{5}',
    flags: '',
    explanation: '3-2-5 자리 또는 10자리 연속 숫자로 된 사업자등록번호를 검증합니다. 하이픈은 선택사항입니다.',
    examples: {
      valid: ['123-45-67890', '1234567890', '000-00-00000'],
      invalid: ['123-456-7890', '12-34-56789', '123456789', 'abc-45-67890']
    },
    tags: ['사업자등록번호', 'business', '번호', 'korean', '기업'],
    usage_count: 2109,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'korean_resident_number',
    title: '주민등록번호',
    category: 'korean',
    difficulty: 'intermediate',
    description: '한국의 주민등록번호 형식을 검증합니다.',
    pattern: '^[0-9]{6}-?[1-4][0-9]{6}',
    flags: '',
    explanation: '6자리 생년월일과 7자리 식별번호로 구성된 주민등록번호를 검증합니다. 7번째 자리는 1-4 중 하나여야 합니다.',
    examples: {
      valid: ['901201-1234567', '9012011234567', '801201-2123456'],
      invalid: ['901201-5234567', '90120-1234567', '901201-123456', 'abc123-1234567']
    },
    tags: ['주민등록번호', 'resident', 'ID', 'korean', '신분증'],
    usage_count: 1876,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 추가 웹 패턴들
  // =========================
  {
    id: 'domain_name',
    title: '도메인 이름',
    category: 'web',
    difficulty: 'intermediate',
    description: '유효한 도메인 이름을 검증합니다.',
    pattern: '^[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.[a-zA-Z]{2,}$',
    flags: '',
    explanation: '도메인 이름 규칙에 따라 영문자, 숫자, 하이픈으로 구성된 유효한 도메인을 검증합니다.',
    examples: {
      valid: ['example.com', 'sub.domain.org', 'test-site.co.kr', 'localhost'],
      invalid: ['-example.com', 'example-.com', 'example..com', '.example.com']
    },
    tags: ['domain', '도메인', 'DNS', 'web'],
    usage_count: 4321,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'slug_url',
    title: 'URL 슬러그',
    category: 'web',
    difficulty: 'beginner',
    description: 'URL에 사용할 수 있는 슬러그 형식을 검증합니다.',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*',
    flags: '',
    explanation: '소문자, 숫자, 하이픈으로만 구성된 URL 슬러그를 검증합니다. 연속된 하이픈은 허용하지 않습니다.',
    examples: {
      valid: ['hello-world', 'my-article-123', 'simple-slug'],
      invalid: ['Hello-World', 'my--article', '-hello', 'hello-', 'hello_world']
    },
    tags: ['URL', 'slug', '슬러그', 'web', 'SEO'],
    usage_count: 3210,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  // =========================
  // 파일 패턴들
  // =========================
  {
    id: 'file_extension_image',
    title: '이미지 파일 확장자',
    category: 'data',
    difficulty: 'beginner',
    description: '일반적인 이미지 파일의 확장자를 매칭합니다.',
    pattern: '\\.(jpe?g|png|gif|bmp|svg|webp)',
    flags: 'i',
    explanation: 'JPEG, PNG, GIF, BMP, SVG, WebP 등의 이미지 파일 확장자를 매칭합니다. 대소문자를 구분하지 않습니다.',
    examples: {
      valid: ['image.jpg', 'photo.png', 'icon.svg', 'banner.webp'],
      invalid: ['document.pdf', 'file.txt', 'video.mp4']
    },
    tags: ['file', '파일', 'image', '이미지', 'extension'],
    usage_count: 2876,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  },

  {
    id: 'file_extension_document',
    title: '문서 파일 확장자',
    category: 'data',
    difficulty: 'beginner',
    description: '일반적인 문서 파일의 확장자를 매칭합니다.',
    pattern: '\\.(pdf|docx?|xlsx?|pptx?|txt|rtf)',
    flags: 'i',
    explanation: 'PDF, Word, Excel, PowerPoint, 텍스트 파일 등의 문서 확장자를 매칭합니다.',
    examples: {
      valid: ['report.pdf', 'document.docx', 'spreadsheet.xlsx', 'presentation.pptx'],
      invalid: ['image.jpg', 'video.mp4', 'audio.mp3']
    },
    tags: ['file', '파일', 'document', '문서', 'extension'],
    usage_count: 2345,
    created_date: '2024-01-01',
    updated_date: '2024-01-01'
  }
];

// =========================
// Pattern Categories
// =========================
window.PatternCategories = {
  all: { name: '전체', icon: 'fas fa-th-large', description: '모든 패턴' },
  basic: { name: '기본 패턴', icon: 'fas fa-star', description: '자주 사용하는 기본 패턴들' },
  validation: { name: '검증 패턴', icon: 'fas fa-shield-alt', description: '데이터 검증을 위한 패턴들' },
  korean: { name: '한국어 패턴', icon: 'fas fa-flag', description: '한국어 및 한국 특화 패턴들' },
  development: { name: '개발자 패턴', icon: 'fas fa-code', description: '개발에 유용한 패턴들' },
  web: { name: '웹 패턴', icon: 'fas fa-globe', description: '웹 개발 관련 패턴들' },
  data: { name: '데이터 패턴', icon: 'fas fa-database', description: '데이터 형식 검증 패턴들' },
  security: { name: '보안 패턴', icon: 'fas fa-lock', description: '보안 관련 검증 패턴들' }
};

// =========================
// Difficulty Levels
// =========================
window.DifficultyLevels = {
  beginner: { name: '초급', color: 'success', description: '정규식 기초 사용자' },
  intermediate: { name: '중급', color: 'warning', description: '중간 수준의 정규식 사용자' },
  advanced: { name: '고급', color: 'error', description: '고급 정규식 사용자' }
};

// =========================
// Pattern Search Functions
// =========================
window.PatternUtils = {
  /**
   * 카테고리별 패턴 필터링
   */
  getPatternsByCategory: function(category) {
    if (category === 'all') return window.RegexPatterns;
    return window.RegexPatterns.filter(pattern => pattern.category === category);
  },

  /**
   * 난이도별 패턴 필터링
   */
  getPatternsByDifficulty: function(difficulty) {
    return window.RegexPatterns.filter(pattern => pattern.difficulty === difficulty);
  },

  /**
   * 태그로 패턴 검색
   */
  searchPatternsByTag: function(tag) {
    const searchTerm = tag.toLowerCase();
    return window.RegexPatterns.filter(pattern => 
      pattern.tags.some(t => t.toLowerCase().includes(searchTerm))
    );
  },

  /**
   * 키워드로 패턴 검색
   */
  searchPatterns: function(keyword) {
    const searchTerm = keyword.toLowerCase();
    return window.RegexPatterns.filter(pattern => 
      pattern.title.toLowerCase().includes(searchTerm) ||
      pattern.description.toLowerCase().includes(searchTerm) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  /**
   * ID로 패턴 찾기
   */
  getPatternById: function(id) {
    return window.RegexPatterns.find(pattern => pattern.id === id);
  },

  /**
   * 인기 패턴 정렬
   */
  sortByPopularity: function(patterns) {
    return patterns.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
  },

  /**
   * 이름순 정렬
   */
  sortByName: function(patterns) {
    return patterns.sort((a, b) => a.title.localeCompare(b.title));
  },

  /**
   * 최신순 정렬
   */
  sortByDate: function(patterns) {
    return patterns.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  },

  /**
   * 난이도순 정렬
   */
  sortByDifficulty: function(patterns) {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    return patterns.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
  },

  /**
   * 패턴 통계 정보
   */
  getStatistics: function() {
    const stats = {
      total: window.RegexPatterns.length,
      categories: {},
      difficulties: {},
      totalUsage: 0
    };

    window.RegexPatterns.forEach(pattern => {
      // 카테고리별 통계
      stats.categories[pattern.category] = (stats.categories[pattern.category] || 0) + 1;
      
      // 난이도별 통계
      stats.difficulties[pattern.difficulty] = (stats.difficulties[pattern.difficulty] || 0) + 1;
      
      // 총 사용 횟수
      stats.totalUsage += pattern.usage_count || 0;
    });

    return stats;
  }
};

// =========================
// 초기화 및 내보내기
// =========================
console.log(`📊 패턴 데이터 로드 완료: ${window.RegexPatterns.length}개 패턴`);
console.log('📈 패턴 통계:', window.PatternUtils.getStatistics());