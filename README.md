# 퓨론 (Furon) - LG 공감형 지능

한국예술종합학교와 LG가 협력하여 개발한 공감형 지능 스마트홈 가이드입니다.

## 시작하기

### 1. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 Google Studio AI API 키를 설정하세요:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 2. 개발 서버 실행
```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하세요.

### 3. API 키 설정
- 웹 인터페이스에서 "API 설정" 버튼 클릭
- Google Studio AI API 키 입력
- 또는 환경변수에 설정된 키가 자동으로 로드됩니다

## 기능

- 음성 인식 및 텍스트 입력
- Google Studio Gemini API 연동
- 스마트홈 제어 제안 (에어컨, 공기청정기, 조명, 냉장고, 스피커)
- 모바일 최적화된 인터페이스
