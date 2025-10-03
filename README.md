# 퓨론 (Furon) - LG 공감형 지능

한국예술종합학교와 LG가 협력하여 개발한 공감형 지능 스마트홈 가이드입니다.

## 시작하기

### 1. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 Google Studio AI API 키를 설정하세요:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. 개발 서버 실행
```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하세요.

### 3. API 키 발급 및 설정
- [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급
- 무료 할당량: 월 15회 요청 (Gemini Flash)
- **중요**: API 키는 서버 환경변수에서만 관리됩니다 (보안)

## 기능

- 음성 인식 및 텍스트 입력
- Google Studio Gemini API 연동
- 스마트홈 제어 제안 (에어컨, 공기청정기, 조명, 냉장고, 스피커)
- 모바일 최적화된 인터페이스
