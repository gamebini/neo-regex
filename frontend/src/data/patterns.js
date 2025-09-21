// frontend/src/data/patterns.js - 확장된 패턴 라이브러리
/**
 * NEO Regex 패턴 라이브러리
 * 초보자부터 전문가까지 사용할 수 있는 포괄적인 정규식 패턴 모음
 */

export const PatternLibrary = {
  // 기본 패턴 (초보자용)
  basic: [
    {
      id: 'email_basic',
      title: '이메일 주소 (기본)',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      description: '일반적인 이메일 주소 형식을 검증합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['user@example.com', 'test.email@domain.org', 'name123@company.co.kr'],
        invalid: ['invalid-email', 'user@', '@domain.com', 'user@domain']
      },
      explanation: '^는 시작, [a-zA-Z0-9._%+-]+는 이메일 앞부분, @는 골뱅이, [a-zA-Z0-9.-]+는 도메인, \\.[a-zA-Z]{2,}는 .com 같은 확장자, $는 끝',
      tags: ['이메일', 'email', '기본', 'validation']
    },
    {
      id: 'email_strict',
      title: '이메일 주소 (엄격)',
      pattern: '^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]\\.[a-zA-Z]{2,4}$',
      description: '더 엄격한 이메일 검증 (첫글자와 마지막글자는 영숫자)',
      difficulty: 'intermediate',
      examples: {
        valid: ['user@example.com', 'test123@domain.org'],
        invalid: ['.user@domain.com', 'user.@domain.com', '_test@domain.com']
      },
      explanation: '첫 글자와 마지막 글자는 반드시 영숫자여야 하는 엄격한 이메일 검증',
      tags: ['이메일', 'email', '엄격', 'strict']
    },
    {
      id: 'url_http',
      title: 'HTTP/HTTPS URL',
      pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
      description: 'HTTP 또는 HTTPS 프로토콜의 URL을 검증합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['https://www.example.com', 'http://domain.org/path', 'https://sub.domain.com/page?param=value'],
        invalid: ['ftp://example.com', 'not-a-url', 'www.example.com']
      },
      explanation: 'https?는 http 또는 https, :\\/\\/는 ://, (www\\.)?는 www. 선택적',
      tags: ['url', 'http', 'https', 'link']
    },
    {
      id: 'url_all',
      title: 'URL (모든 프로토콜)',
      pattern: '^(https?|ftp|sftp|ssh):\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
      description: 'HTTP, HTTPS, FTP, SFTP, SSH 프로토콜의 URL을 모두 지원합니다.',
      difficulty: 'intermediate',
      examples: {
        valid: ['https://example.com', 'ftp://files.example.com', 'ssh://server.com:22'],
        invalid: ['example.com', 'invalid://url']
      },
      explanation: '(https?|ftp|sftp|ssh)는 여러 프로토콜 중 하나를 선택',
      tags: ['url', 'ftp', 'ssh', 'protocol']
    },
    {
      id: 'ipv4',
      title: 'IPv4 주소',
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      description: 'IPv4 IP 주소 형식을 검증합니다 (0.0.0.0 ~ 255.255.255.255).',
      difficulty: 'intermediate',
      examples: {
        valid: ['192.168.1.1', '10.0.0.1', '255.255.255.255', '0.0.0.0'],
        invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1', '192.168.01.1']
      },
      explanation: '각 옥텟은 0-255 범위의 숫자. 25[0-5]는 250-255, 2[0-4][0-9]는 200-249',
      tags: ['ip', 'ipv4', 'address', 'network']
    },
    {
      id: 'ipv6',
      title: 'IPv6 주소',
      pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$',
      description: 'IPv6 IP 주소 형식을 검증합니다.',
      difficulty: 'advanced',
      examples: {
        valid: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', '::1', '::'],
        invalid: ['192.168.1.1', 'invalid:ipv6']
      },
      explanation: 'IPv6는 8개 그룹의 16진수로 구성, ::는 축약 표현',
      tags: ['ip', 'ipv6', 'address', 'network']
    },
    {
      id: 'mac_address',
      title: 'MAC 주소',
      pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
      description: 'MAC 주소 형식을 검증합니다 (콜론 또는 하이픈 구분).',
      difficulty: 'intermediate',
      examples: {
        valid: ['00:1B:44:11:3A:B7', '00-1B-44-11-3A-B7', 'aa:bb:cc:dd:ee:ff'],
        invalid: ['00:1B:44:11:3A', '00:1B:44:11:3A:B7:FF', 'gg:hh:ii:jj:kk:ll']
      },
      explanation: '6개 그룹의 2자리 16진수, 구분자는 :또는 -',
      tags: ['mac', 'address', 'network', 'hardware']
    },
    {
      id: 'number_integer',
      title: '정수',
      pattern: '^-?\\d+$',
      description: '양의 정수, 음의 정수, 0을 포함한 모든 정수를 매치합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['123', '-456', '0', '999999'],
        invalid: ['12.34', 'abc', '12a', '']
      },
      explanation: '-?는 마이너스 기호 선택적, \\d+는 하나 이상의 숫자',
      tags: ['숫자', 'number', 'integer', '정수']
    },
    {
      id: 'number_decimal',
      title: '소수',
      pattern: '^-?\\d+(\\.\\d+)?$',
      description: '정수와 소수점 숫자를 모두 매치합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['123', '123.45', '-67.89', '0.1'],
        invalid: ['abc', '12.', '.34', '12.34.56']
      },
      explanation: '(\\.\\d+)?는 소수점과 숫자가 선택적으로 올 수 있음',
      tags: ['숫자', 'number', 'decimal', '소수']
    },
    {
      id: 'number_currency',
      title: '화폐 (원화)',
      pattern: '^[1-9]\\d{0,2}(,\\d{3})*원?$|^0원?$',
      description: '한국 원화 형식 (천 단위 쉼표 포함)을 검증합니다.',
      difficulty: 'intermediate',
      examples: {
        valid: ['1,000원', '123,456,789', '500', '0원'],
        invalid: ['01,000', '1,00', '1000,', 'abc원']
      },
      explanation: '천 단위마다 쉼표, 맨 앞은 1-9로 시작 (선행 0 방지)',
      tags: ['화폐', 'money', 'currency', '원화', '쉼표']
    }
  ],

  // 한국어 패턴
  korean: [
    {
      id: 'phone_mobile',
      title: '휴대폰 번호',
      pattern: '^01[016789]-?\\d{3,4}-?\\d{4}$',
      description: '한국 휴대폰 번호 형식 (010, 011, 016, 017, 018, 019)',
      difficulty: 'beginner',
      examples: {
        valid: ['010-1234-5678', '01012345678', '011-123-4567', '016-9876-5432'],
        invalid: ['02-1234-5678', '010-12-5678', '010-1234-567']
      },
      explanation: '01은 고정, [016789]는 휴대폰 번호 두 번째 자리, -?는 하이픈 선택적',
      tags: ['전화번호', 'phone', '휴대폰', 'mobile']
    },
    {
      id: 'phone_landline',
      title: '지역번호 (유선전화)',
      pattern: '^0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4])-?\\d{3,4}-?\\d{4}$',
      description: '한국 지역번호 유선전화 형식',
      difficulty: 'intermediate',
      examples: {
        valid: ['02-1234-5678', '031-123-4567', '051-987-6543'],
        invalid: ['010-1234-5678', '09-1234-5678', '02-12-5678']
      },
      explanation: '02는 서울, 031-033은 경기/강원, 041-044는 충청 등',
      tags: ['전화번호', 'phone', '유선전화', 'landline']
    },
    {
      id: 'hangul_only',
      title: '한글만',
      pattern: '^[가-힣]+$',
      description: '완성형 한글 문자만 허용합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['안녕하세요', '정규식', '한글테스트'],
        invalid: ['Hello', '안녕123', '한글!', 'ㄱㄴㄷ']
      },
      explanation: '[가-힣]는 완성형 한글 문자 범위, +는 하나 이상',
      tags: ['한글', 'hangul', 'korean', '문자']
    },
    {
      id: 'hangul_with_space',
      title: '한글 + 공백',
      pattern: '^[가-힣\\s]+$',
      description: '한글과 공백만 허용합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['안녕 하세요', '정규식 테스트', '한글 공백 테스트'],
        invalid: ['Hello World', '안녕123', '한글!@#']
      },
      explanation: '\\s는 공백 문자 (스페이스, 탭, 줄바꿈)',
      tags: ['한글', 'hangul', '공백', 'space']
    },
    {
      id: 'korean_name',
      title: '한국 이름',
      pattern: '^[가-힣]{2,5}$',
      description: '2-5자의 한국 이름을 검증합니다.',
      difficulty: 'beginner',
      examples: {
        valid: ['김철수', '이영희', '박미영', '홍길동'],
        invalid: ['김', '김철수영희박미영', 'Kim', '김철수1']
      },
      explanation: '{2,5}는 2자 이상 5자 이하',
      tags: ['이름', 'name', '한국이름']
    },
    {
      id: 'korean_company',
      title: '한국 회사명',
      pattern: '^[가-힣a-zA-Z0-9\\s()\\-&.]{2,50}(주식회사|유한회사|합자회사|합명회사|협동조합|재단법인|사단법인|학교법인|의료법인)?$',
      description: '한국 회사명 형식 (법인 형태 포함)',
      difficulty: 'advanced',
      examples: {
        valid: ['삼성전자주식회사', '네이버 주식회사', 'LG유한회사', '카카오'],
        invalid: ['!@#회사', '가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하']
      },
      explanation: '한글, 영문, 숫자, 일부 특수문자와 법인 형태를 포함',
      tags: ['회사명', 'company', '법인']
    },
    {
      id: 'postal_code',
      title: '우편번호',
      pattern: '^\\d{5}$',
      description: '한국 우편번호 (5자리 숫자)',
      difficulty: 'beginner',
      examples: {
        valid: ['12345', '06234', '99999'],
        invalid: ['1234', '123456', 'abcde', '12-345']
      },
      explanation: '\\d{5}는 정확히 5자리 숫자',
      tags: ['우편번호', 'postal', 'zip']
    },
    {
      id: 'business_number',
      title: '사업자등록번호',
      pattern: '^\\d{3}-?\\d{2}-?\\d{5}$',
      description: '한국 사업자등록번호 (10자리, 하이픈 선택적)',
      difficulty: 'intermediate',
      examples: {
        valid: ['123-45-67890', '1234567890'],
        invalid: ['123-456-7890', '12-34-56789', 'abc-de-fghij']
      },
      explanation: '3자리-2자리-5자리 형식, 하이픈은 선택적',
      tags: ['사업자등록번호', 'business', '등록번호']
    },
    {
      id: 'resident_number',
      title: '주민등록번호',
      pattern: '^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-?[1-4]-?[0-9]{6}$',
      description: '한국 주민등록번호 (생년월일 검증 포함)',
      difficulty: 'advanced',
      examples: {
        valid: ['901201-1234567', '850315-2123456'],
        invalid: ['901301-1234567', '850230-1234567', '901201-5234567']
      },
      explanation: 'YYMMDD 형식의 생년월일 + 성별코드(1-4) + 6자리',
      tags: ['주민등록번호', 'resident', 'ssn']
    }
  ],

  // 검증 패턴
  validation: [
    {
      id: 'password_weak',
      title: '기본 비밀번호',
      pattern: '^.{6,}$',
      description: '최소 6자 이상의 비밀번호',
      difficulty: 'beginner',
      examples: {
        valid: ['123456', 'password', 'abcdef'],
        invalid: ['12345', 'abc', '']
      },
      explanation: '.{6,}는 아무 문자 6개 이상',
      tags: ['비밀번호', 'password', '기본']
    },
    {
      id: 'password_medium',
      title: '중간 비밀번호',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',
      description: '대문자, 소문자, 숫자 포함 8자 이상',
      difficulty: 'intermediate',
      examples: {
        valid: ['Password123', 'MyPass1', 'Test1234'],
        invalid: ['password', 'PASSWORD', '12345678', 'Password']
      },
      explanation: '(?=.*[a-z])는 소문자 포함 확인, (?=.*[A-Z])는 대문자, (?=.*\\d)는 숫자',
      tags: ['비밀번호', 'password', '중간']
    },
    {
      id: 'password_strong',
      title: '강력한 비밀번호',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      description: '대소문자, 숫자, 특수문자 포함 8자 이상',
      difficulty: 'intermediate',
      examples: {
        valid: ['Password123!', 'MyP@ssw0rd', 'Secure#2024'],
        invalid: ['password', '12345678', 'Password123']
      },
      explanation: '특수문자 [@$!%*?&] 중 하나도 포함해야 함',
      tags: ['비밀번호', 'password', '강력']
    },
    {
      id: 'password_ultra',
      title: '최고 보안 비밀번호',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])(?=.*[#^+=<>{}\\[\\]|~`]).{12,}$',
      description: '대소문자, 숫자, 2종류 특수문자 포함 12자 이상',
      difficulty: 'advanced',
      examples: {
        valid: ['MyP@ssw0rd#2024', 'Secure$Pass[123]'],
        invalid: ['Password123!', 'MyP@ssw0rd']
      },
      explanation: '두 종류의 특수문자 그룹을 모두 포함해야 하는 초강력 비밀번호',
      tags: ['비밀번호', 'password', '최고보안']
    },
    {
      id: 'credit_card_visa',
      title: 'Visa 카드',
      pattern: '^4[0-9]{12}(?:[0-9]{3})?$',
      description: 'Visa 신용카드 번호 (4로 시작, 13-16자리)',
      difficulty: 'intermediate',
      examples: {
        valid: ['4111111111111111', '4000000000000002'],
        invalid: ['5111111111111111', '411111111111111']
      },
      explanation: '4로 시작, 총 13자리 또는 16자리',
      tags: ['신용카드', 'credit', 'visa']
    },
    {
      id: 'credit_card_master',
      title: 'MasterCard',
      pattern: '^5[1-5][0-9]{14}$',
      description: 'MasterCard 신용카드 번호 (51-55로 시작, 16자리)',
      difficulty: 'intermediate',
      examples: {
        valid: ['5555555555554444', '5105105105105100'],
        invalid: ['4111111111111111', '5055555555554444']
      },
      explanation: '5로 시작하고 두 번째 자리는 1-5, 총 16자리',
      tags: ['신용카드', 'credit', 'mastercard']
    },
    {
      id: 'credit_card_amex',
      title: 'American Express',
      pattern: '^3[47][0-9]{13}$',
      description: 'American Express 카드 (34 또는 37로 시작, 15자리)',
      difficulty: 'intermediate',
      examples: {
        valid: ['378282246310005', '341111111111111'],
        invalid: ['4111111111111111', '3811111111111111']
      },
      explanation: '34 또는 37로 시작, 총 15자리',
      tags: ['신용카드', 'credit', 'amex']
    },
    {
      id: 'date_yyyy_mm_dd',
      title: '날짜 (YYYY-MM-DD)',
      pattern: '^(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
      description: 'ISO 8601 날짜 형식 (1900-2099년)',
      difficulty: 'intermediate',
      examples: {
        valid: ['2024-01-15', '1990-12-25', '2000-02-29'],
        invalid: ['24-01-15', '2024-13-01', '2024-02-30']
      },
      explanation: '(19|20)\\d{2}는 1900-2099년, (0[1-9]|1[0-2])는 01-12월',
      tags: ['날짜', 'date', 'iso8601']
    },
    {
      id: 'time_24hour',
      title: '시간 (24시간)',
      pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
      description: '24시간 형식의 시간 (HH:MM)',
      difficulty: 'intermediate',
      examples: {
        valid: ['09:30', '14:45', '23:59', '00:00'],
        invalid: ['25:00', '14:60', '9:5', '24:00']
      },
      explanation: '([01]?[0-9]|2[0-3])는 00-23시, [0-5][0-9]는 00-59분',
      tags: ['시간', 'time', '24hour']
    }
  ],

  // 개발자 패턴
  developer: [
    {
      id: 'html_tag',
      title: 'HTML 태그',
      pattern: '<([a-z][a-z0-9]*)\\b[^>]*>(.*?)</\\1>',
      description: '여는 태그와 닫는 태그가 일치하는 HTML 태그',
      difficulty: 'advanced',
      examples: {
        valid: ['<div>내용</div>', '<p class="text">문단</p>', '<span id="test">텍스트</span>'],
        invalid: ['<div>내용</span>', '<div>내용', 'div>내용</div>']
      },
      explanation: '\\1은 첫 번째 그룹 참조로 여는 태그와 닫는 태그 일치 확인',
      tags: ['html', 'tag', 'markup']
    },
    {
      id: 'html_self_closing',
      title: 'HTML 자체 닫는 태그',
      pattern: '<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\\b[^>]*\\/??>',
      description: '자체 닫는 HTML 태그 (img, br, hr 등)',
      difficulty: 'intermediate',
      examples: {
        valid: ['<img src="test.jpg">', '<br />', '<hr>', '<input type="text" />'],
        invalid: ['<div />', '<span />']
      },
      explanation: '자체 닫는 태그들의 목록을 정의하고 매치',
      tags: ['html', 'self-closing', 'void']
    },
    {
      id: 'css_hex_color',
      title: 'CSS 색상 (HEX)',
      pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$',
      description: 'CSS HEX 색상 코드 (#RGB 또는 #RRGGBB)',
      difficulty: 'beginner',
      examples: {
        valid: ['#fff', '#ffffff', '#123ABC', '#000'],
        invalid: ['#gg', '#12345', 'ffffff', '#1234']
      },
      explanation: '(?:[0-9a-fA-F]{3}){1,2}는 3자리 또는 6자리 16진수',
      tags: ['css', 'color', 'hex']
    },
    {
      id: 'css_rgb',
      title: 'CSS RGB 색상',
      pattern: '^rgb\\(\\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\\s*,\\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\\s*,\\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\\s*\\)$',
      description: 'CSS RGB 색상 함수 (0-255 값)',
      difficulty: 'advanced',
      examples: {
        valid: ['rgb(255, 0, 0)', 'rgb(0,255,0)', 'rgb( 128 , 128 , 128 )'],
        invalid: ['rgb(256, 0, 0)', 'rgb(255, 0)', 'rgb(-1, 0, 0)']
      },
      explanation: '각 RGB 값은 0-255 범위, 공백 허용',
      tags: ['css', 'color', 'rgb']
    },
    {
      id: 'json_string',
      title: 'JSON 문자열',
      pattern: '^"([^"\\\\]|\\\\.)*"$',
      description: 'JSON 형식의 문자열 (이스케이프 문자 포함)',
      difficulty: 'advanced',
      examples: {
        valid: ['"hello"', '"hello world"', '"hello\\"world\\""', '"line1\\nline2"'],
        invalid: ['"hello', 'hello"', '"hello"world"']
      },
      explanation: '([^"\\\\]|\\\\.)*는 따옴표가 아닌 문자 또는 이스케이프된 문자',
      tags: ['json', 'string', 'escape']
    },
    {
      id: 'javascript_variable',
      title: 'JavaScript 변수명',
      pattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*$',
      description: 'JavaScript 변수명 규칙 (영문자, _, $로 시작)',
      difficulty: 'intermediate',
      examples: {
        valid: ['myVar', '_private', '$element', 'userName123'],
        invalid: ['123var', 'my-var', 'class', 'my var']
      },
      explanation: '[a-zA-Z_$]로 시작, 이후 [a-zA-Z0-9_$] 가능',
      tags: ['javascript', 'variable', 'identifier']
    },
    {
      id: 'sql_injection',
      title: 'SQL 인젝션 감지',
      pattern: '(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\\b)|(--|/\\*|\\*/|;|\\||&)',
      description: 'SQL 인젝션 공격 패턴을 감지합니다',
      difficulty: 'advanced',
      examples: {
        valid: ['SELECT * FROM users', "'; DROP TABLE users; --", 'UNION SELECT password'],
        invalid: ['normal text', 'user input', 'safe query']
      },
      explanation: 'SQL 키워드와 주석, 특수문자 조합을 감지',
      tags: ['sql', 'injection', 'security', '보안']
    },
    {
      id: 'version_semantic',
      title: '시맨틱 버전',
      pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?',
      description: '시맨틱 버전 형식 (MAJOR.MINOR.PATCH)',
      difficulty: 'advanced',
      examples: {
        valid: ['1.0.0', '10.20.30', '1.1.2-prerelease+meta', '1.0.0-alpha.1'],
        invalid: ['1', '1.2', '1.2.a', '1.2.3-']
      },
      explanation: 'MAJOR.MINOR.PATCH 형식, 선택적 pre-release와 build metadata',
      tags: ['version', 'semantic', 'semver']
    },
    {
      id: 'git_commit_hash',
      title: 'Git 커밋 해시',
      pattern: '^[a-f0-9]{7,40}',
      description: 'Git 커밋 해시 (7-40자의 16진수)',
      difficulty: 'intermediate',
      examples: {
        valid: ['a1b2c3d', 'abc123def456789', '1234567890abcdef1234567890abcdef12345678'],
        invalid: ['123456', 'ghijk', 'a1b2c3d4e5f6g7h8']
      },
      explanation: '[a-f0-9]{7,40}는 7자 이상 40자 이하의 16진수',
      tags: ['git', 'commit', 'hash', 'sha']
    },
    {
      id: 'docker_image',
      title: 'Docker 이미지명',
      pattern: '^[a-z0-9]+([._-][a-z0-9]+)*(/[a-z0-9]+([._-][a-z0-9]+)*)*',
      description: 'Docker 이미지 이름 형식',
      difficulty: 'intermediate',
      examples: {
        valid: ['nginx', 'ubuntu', 'my-app', 'registry.com/user/app'],
        invalid: ['Nginx', 'MY-APP', '-nginx', 'nginx-']
      },
      explanation: '소문자, 숫자, 점, 하이픈, 언더스코어만 허용',
      tags: ['docker', 'image', 'container']
    },
    {
      id: 'api_key',
      title: 'API 키 형식',
      pattern: '^[A-Za-z0-9]{32,128}',
      description: '일반적인 API 키 형식 (32-128자의 영숫자)',
      difficulty: 'intermediate',
      examples: {
        valid: ['abc123def456ghi789jkl012mno345pqr', 'APIKey1234567890ABCDEF'],
        invalid: ['short', 'api-key-with-dashes', 'key with spaces']
      },
      explanation: '32자 이상 128자 이하의 영문자와 숫자 조합',
      tags: ['api', 'key', 'token', 'auth']
    }
  ],

  // 고급 패턴
  advanced: [
    {
      id: 'regex_lookahead',
      title: '전방 탐색 예제',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*',
      description: '전방 탐색을 사용한 패스워드 검증',
      difficulty: 'advanced',
      examples: {
        valid: ['Password123', 'Test1', 'Aa1'],
        invalid: ['password', 'PASSWORD', '123456']
      },
      explanation: '(?=.*[a-z])는 소문자 포함 확인하는 전방 탐색',
      tags: ['lookahead', '전방탐색', 'advanced']
    },
    {
      id: 'regex_lookbehind',
      title: '후방 탐색 예제',
      pattern: '(?<=@)[a-zA-Z0-9.-]+',
      description: '@기호 뒤의 도메인 부분만 매치',
      difficulty: 'advanced',
      examples: {
        valid: ['user@example.com → example.com', 'test@domain.org → domain.org'],
        invalid: ['example.com (@ 없음)', '@domain (@ 앞에 문자 없음)']
      },
      explanation: '(?<=@)는 @ 뒤에 오는 부분만 매치하는 후방 탐색',
      tags: ['lookbehind', '후방탐색', 'advanced']
    },
    {
      id: 'regex_backreference',
      title: '역참조 예제',
      pattern: '\\b(\\w+)\\s+\\1\\b',
      description: '연속된 중복 단어 찾기',
      difficulty: 'advanced',
      examples: {
        valid: ['hello hello', 'test test case', 'word word'],
        invalid: ['hello world', 'test case', 'different words']
      },
      explanation: '\\1은 첫 번째 그룹 (\\w+)과 같은 내용을 참조',
      tags: ['backreference', '역참조', 'duplicate']
    },
    {
      id: 'balanced_parentheses',
      title: '균형잡힌 괄호',
      pattern: '^\\((?:[^()]|\\([^()]*\\))*\\)',
      description: '한 단계 중첩된 균형잡힌 괄호',
      difficulty: 'expert',
      examples: {
        valid: ['(hello)', '(hello (world))', '(test (nested) content)'],
        invalid: ['((nested))', '(unbalanced', 'no parentheses']
      },
      explanation: '(?:[^()]|\\([^()]*\\))*는 괄호가 아닌 문자 또는 한 단계 중첩 괄호',
      tags: ['괄호', 'balanced', 'nested', 'expert']
    },
    {
      id: 'css_units',
      title: 'CSS 단위',
      pattern: '^-?\\d+(\\.\\d+)?(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch|vmin|vmax)',
      description: 'CSS 크기 단위 (숫자 + 단위)',
      difficulty: 'intermediate',
      examples: {
        valid: ['10px', '1.5em', '100%', '-5rem', '50vh'],
        invalid: ['10', 'px', '10.px', '10.5.5px']
      },
      explanation: '-?\\d+(\\.\\d+)?는 선택적 마이너스와 소수점, 이후 CSS 단위',
      tags: ['css', 'unit', 'size', 'dimension']
    },
    {
      id: 'markdown_link',
      title: 'Markdown 링크',
      pattern: '\\[([^\\]]+)\\]\\(([^\\)]+)\\)',
      description: 'Markdown 형식의 링크 [텍스트](URL)',
      difficulty: 'intermediate',
      examples: {
        valid: ['[Google](https://google.com)', '[링크 텍스트](http://example.com)'],
        invalid: ['[텍스트]()', '[](링크)', 'Google](https://google.com)']
      },
      explanation: '\\[([^\\]]+)\\]는 대괄호 안의 텍스트, \\(([^\\)]+)\\)는 소괄호 안의 URL',
      tags: ['markdown', 'link', 'text', 'url']
    },
    {
      id: 'ipv4_with_port',
      title: 'IP주소:포트',
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):[1-9]\\d{0,4}',
      description: 'IPv4 주소와 포트 번호 조합',
      difficulty: 'advanced',
      examples: {
        valid: ['192.168.1.1:8080', '10.0.0.1:3000', '127.0.0.1:80'],
        invalid: ['192.168.1.1:0', '256.1.1.1:8080', '192.168.1.1:70000']
      },
      explanation: 'IPv4 패턴 + 콜론 + 1-65535 포트 번호',
      tags: ['ip', 'port', 'network', 'server']
    },
    {
      id: 'base64',
      title: 'Base64 인코딩',
      pattern: '^[A-Za-z0-9+/]*={0,2}',
      description: 'Base64 인코딩된 문자열',
      difficulty: 'intermediate',
      examples: {
        valid: ['SGVsbG8=', 'V29ybGQ=', 'VGVzdA==', 'QWxhZGRpbjpvcGVuIHNlc2FtZQ=='],
        invalid: ['Hello!', 'Invalid@', 'SGVs bG8=']
      },
      explanation: '[A-Za-z0-9+/]*는 Base64 문자, ={0,2}는 패딩 0-2개',
      tags: ['base64', 'encoding', 'data']
    }
  ],

  // 특수 패턴
  special: [
    {
      id: 'emoji',
      title: '이모지',
      pattern: '[\\u{1F600}-\\u{1F64F}]|[\\u{1F300}-\\u{1F5FF}]|[\\u{1F680}-\\u{1F6FF}]|[\\u{1F1E0}-\\u{1F1FF}]',
      description: '기본 이모지 유니코드 범위',
      difficulty: 'advanced',
      examples: {
        valid: ['😀', '😎', '🚀', '🌟', '🇰🇷'],
        invalid: ['text', '123', 'abc']
      },
      explanation: '유니코드 이모지 블록들의 범위',
      tags: ['emoji', 'unicode', '이모지']
    },
    {
      id: 'xml_tag',
      title: 'XML 태그',
      pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s+[a-zA-Z][a-zA-Z0-9]*\\s*=\\s*["\'][^"\']*["\'])*\\s*\\/?\\s*>',
      description: 'XML 태그 (속성 포함)',
      difficulty: 'expert',
      examples: {
        valid: ['<tag>', '<tag attr="value">', '</tag>', '<self-closing />'],
        invalid: ['<123tag>', '<tag attr=value>', '< tag >']
      },
      explanation: '복잡한 XML 태그 구조를 포괄적으로 매치',
      tags: ['xml', 'tag', 'markup', 'attributes']
    },
    {
      id: 'log_timestamp',
      title: '로그 타임스탬프',
      pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}(\\.\\d{3})? (\\[\\w+\\]|\\w+)(:| -) ',
      description: '일반적인 로그 파일 타임스탬프 형식',
      difficulty: 'advanced',
      examples: {
        valid: ['2024-01-15 14:30:25 INFO: ', '2024-01-15 14:30:25.123 [ERROR]: ', '2024-01-15 14:30:25 DEBUG - '],
        invalid: ['01-15-2024 14:30:25', '2024-01-15 25:30:25', '2024-01-15']
      },
      explanation: 'YYYY-MM-DD HH:MM:SS + 선택적 밀리초 + 로그 레벨',
      tags: ['log', 'timestamp', 'datetime', 'level']
    },
    {
      id: 'file_path_windows',
      title: 'Windows 파일 경로',
      pattern: '^[a-zA-Z]:\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*',
      description: 'Windows 스타일 파일 경로',
      difficulty: 'advanced',
      examples: {
        valid: ['C:\\Users\\Documents\\file.txt', 'D:\\Projects\\app.exe'],
        invalid: ['C:/Users/file.txt', '/usr/local/bin', 'C:\\file?.txt']
      },
      explanation: '드라이브 문자 + 콜론 + 백슬래시 + 유효한 파일명들',
      tags: ['file', 'path', 'windows', 'filesystem']
    },
    {
      id: 'file_path_unix',
      title: 'Unix 파일 경로',
      pattern: '^(/[^/ ]*)+/?',
      description: 'Unix/Linux 스타일 파일 경로',
      difficulty: 'intermediate',
      examples: {
        valid: ['/usr/local/bin', '/home/user/documents/file.txt', '/var/log/'],
        invalid: ['C:\\Windows', 'relative/path', '//double/slash']
      },
      explanation: '슬래시로 시작하는 절대 경로, 공백 없는 파일명',
      tags: ['file', 'path', 'unix', 'linux']
    },
    {
      id: 'mime_type',
      title: 'MIME 타입',
      pattern: '^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9\\!\\#\\$\\&\\-\\^]*\/[a-zA-Z0-9][a-zA-Z0-9\\!\\#\\$\\&\\-\\^]*',
      description: 'MIME 타입 형식 (type/subtype)',
      difficulty: 'advanced',
      examples: {
        valid: ['text/html', 'image/jpeg', 'application/json', 'video/mp4'],
        invalid: ['text', 'text/', '/html', 'text//html']
      },
      explanation: 'type/subtype 형식, 영문자로 시작하고 특정 특수문자 허용',
      tags: ['mime', 'content-type', 'media', 'http']
    }
  ],

  // 게임/엔터테인먼트 패턴
  entertainment: [
    {
      id: 'license_plate_kr',
      title: '한국 자동차 번호판',
      pattern: '^\\d{2,3}[가-힣]\\d{4}',
      description: '한국 자동차 번호판 형식',
      difficulty: 'intermediate',
      examples: {
        valid: ['12가1234', '345나5678', '01다9999'],
        invalid: ['1가1234', '12a1234', '12가123']
      },
      explanation: '2-3자리 숫자 + 한글 1자 + 4자리 숫자',
      tags: ['번호판', 'license', 'car', '자동차']
    },
    {
      id: 'youtube_video_id',
      title: 'YouTube 비디오 ID',
      pattern: '^[a-zA-Z0-9_-]{11}',
      description: 'YouTube 비디오 ID (11자리)',
      difficulty: 'beginner',
      examples: {
        valid: ['dQw4w9WgXcQ', 'jNQXAC9IVRw', 'y6120QOlsfU'],
        invalid: ['short', 'toolongvideoid', 'invalid@id']
      },
      explanation: '정확히 11자리의 영문자, 숫자, 하이픈, 언더스코어',
      tags: ['youtube', 'video', 'id', 'social']
    },
    {
      id: 'instagram_username',
      title: 'Instagram 사용자명',
      pattern: '^[a-zA-Z0-9._]{1,30}',
      description: 'Instagram 사용자명 형식 (1-30자)',
      difficulty: 'beginner',
      examples: {
        valid: ['user123', 'my.account', 'test_user', 'a'],
        invalid: ['user-name', 'user@name', '', 'verylongusernamethatistoolong123456']
      },
      explanation: '영문자, 숫자, 점, 언더스코어만 허용, 1-30자',
      tags: ['instagram', 'username', 'social', 'account']
    },
    {
      id: 'discord_tag',
      title: 'Discord 태그',
      pattern: '^.{2,32}#[0-9]{4}',
      description: 'Discord 사용자 태그 (이름#1234)',
      difficulty: 'intermediate',
      examples: {
        valid: ['User#1234', 'TestUser#0001', 'MyName#9999'],
        invalid: ['User1234', 'U#1234', 'User#12345', 'User#abcd']
      },
      explanation: '2-32자 이름 + # + 정확히 4자리 숫자',
      tags: ['discord', 'tag', 'username', 'gaming']
    },
    {
      id: 'minecraft_username',
      title: 'Minecraft 사용자명',
      pattern: '^[a-zA-Z0-9_]{3,16}',
      description: 'Minecraft 사용자명 (3-16자, 영숫자와 언더스코어)',
      difficulty: 'beginner',
      examples: {
        valid: ['Steve', 'Alex_123', 'Notch', 'Player1'],
        invalid: ['ab', 'toolongusernamehere', 'user-name', 'user@name']
      },
      explanation: '영문자, 숫자, 언더스코어만 허용, 3-16자',
      tags: ['minecraft', 'username', 'gaming']
    }
  ],

  // 국가별 패턴
  international: [
    {
      id: 'phone_us',
      title: '미국 전화번호',
      pattern: '^\\+?1?[-.\\s]?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})',
      description: '미국 전화번호 형식 (다양한 구분자 지원)',
      difficulty: 'advanced',
      examples: {
        valid: ['(555) 123-4567', '555-123-4567', '+1 555 123 4567', '15551234567'],
        invalid: ['555-12-4567', '(555) 123-456', '555 123 45678']
      },
      explanation: '선택적 +1, 3자리 지역번호, 3자리-4자리 번호',
      tags: ['phone', 'us', 'america', '미국전화번호']
    },
    {
      id: 'phone_uk',
      title: '영국 전화번호',
      pattern: '^(\\+44\\s?|0)((1[1-9]|2[0-9]|3[0-9]|7[0-9]|8[0-9])\\d{1,2}\\s?\\d{6,7}|800\\s?\\d{6,7})',
      description: '영국 전화번호 형식',
      difficulty: 'expert',
      examples: {
        valid: ['+44 20 7946 0958', '020 7946 0958', '+44 7700 900123'],
        invalid: ['44 20 7946 0958', '020 794 0958']
      },
      explanation: '+44 또는 0으로 시작, 영국 지역번호 규칙 적용',
      tags: ['phone', 'uk', 'britain', '영국전화번호']
    },
    {
      id: 'postal_code_us',
      title: '미국 우편번호 (ZIP)',
      pattern: '^\\d{5}(-\\d{4})?',
      description: '미국 ZIP 코드 (5자리 또는 5+4자리)',
      difficulty: 'beginner',
      examples: {
        valid: ['12345', '12345-6789', '90210'],
        invalid: ['1234', '123456', '12345-678']
      },
      explanation: '5자리 숫자 + 선택적으로 하이픈과 4자리 추가',
      tags: ['postal', 'zip', 'us', '미국우편번호']
    },
    {
      id: 'postal_code_ca',
      title: '캐나다 우편번호',
      pattern: '^[A-Za-z]\\d[A-Za-z]\\s?\\d[A-Za-z]\\d',
      description: '캐나다 우편번호 (A1A 1A1 형식)',
      difficulty: 'intermediate',
      examples: {
        valid: ['K1A 0A6', 'M5V 3A8', 'k1a0a6'],
        invalid: ['K1A 0A', 'K1A-0A6', '12345']
      },
      explanation: '문자-숫자-문자 공백 숫자-문자-숫자 패턴',
      tags: ['postal', 'canada', '캐나다우편번호']
    },
    {
      id: 'iban',
      title: 'IBAN (국제은행계좌번호)',
      pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}',
      description: '국제은행계좌번호 (IBAN) 형식',
      difficulty: 'expert',
      examples: {
        valid: ['GB29 NWBK 6016 1331 9268 19', 'FR14 2004 1010 0505 0001 3M02 606'],
        invalid: ['GB29NWBK60161331926', 'US29 NWBK 6016 1331 9268 19']
      },
      explanation: '국가코드(2자) + 체크숫자(2자) + 은행식별코드 + 계좌번호',
      tags: ['iban', 'bank', 'international', '은행계좌']
    }
  ]
};

// 패턴 검색 및 필터링 유틸리티
export const PatternUtils = {
  /**
   * 카테고리별 패턴 가져오기
   */
  getByCategory(category) {
    return PatternLibrary[category] || [];
  },

  /**
   * 모든 패턴 가져오기
   */
  getAllPatterns() {
    const allPatterns = [];
    Object.keys(PatternLibrary).forEach(category => {
      PatternLibrary[category].forEach(pattern => {
        allPatterns.push({ ...pattern, category });
      });
    });
    return allPatterns;
  },

  /**
   * 패턴 검색
   */
  search(query, category = 'all') {
    const patterns = category === 'all' ? this.getAllPatterns() : this.getByCategory(category);
    const searchTerm = query.toLowerCase();
    
    return patterns.filter(pattern => 
      pattern.title.toLowerCase().includes(searchTerm) ||
      pattern.description.toLowerCase().includes(searchTerm) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  /**
   * 난이도별 패턴 가져오기
   */
  getByDifficulty(difficulty) {
    return this.getAllPatterns().filter(pattern => pattern.difficulty === difficulty);
  },

  /**
   * 랜덤 패턴 가져오기
   */
  getRandomPattern() {
    const allPatterns = this.getAllPatterns();
    return allPatterns[Math.floor(Math.random() * allPatterns.length)];
  },

  /**
   * 패턴 복잡도 분석
   */
  analyzeComplexity(pattern) {
    let complexity = 1;
    
    // 특수 구조 체크
    if (pattern.includes('(?=')) complexity += 2; // 전방 탐색
    if (pattern.includes('(?<=')) complexity += 2; // 후방 탐색
    if (pattern.includes('(?!')) complexity += 2; // 부정 전방 탐색
    if (pattern.includes('(?<!')) complexity += 2; // 부정 후방 탐색
    if (pattern.includes('\\1') || pattern.includes('\\2')) complexity += 1; // 역참조
    
    // 수량자 체크
    const quantifiers = pattern.match(/[*+?{]/g);
    if (quantifiers) complexity += quantifiers.length * 0.5;
    
    // 문자 클래스 체크
    const charClasses = pattern.match(/\[[^\]]+\]/g);
    if (charClasses) complexity += charClasses.length * 0.3;
    
    // 선택 연산자 체크
    const alternatives = pattern.match(/\|/g);
    if (alternatives) complexity += alternatives.length * 0.5;
    
    return Math.min(Math.round(complexity), 10);
  }
};

export default PatternLibrary;