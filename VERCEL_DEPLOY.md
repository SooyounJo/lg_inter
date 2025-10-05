# Vercel 배포 가이드

## 환경변수 설정

Vercel에서 배포할 때 다음 환경변수를 설정해야 합니다:

### 1. Vercel 대시보드에서 환경변수 설정

1. Vercel 프로젝트 대시보드로 이동
2. Settings > Environment Variables 메뉴 선택
3. 다음 환경변수 추가:

```
GEMINI_API_KEY = your_gemini_api_key_here
```

### 2. 환경변수 설정 방법

- **Name**: `GEMINI_API_KEY`
- **Value**: 실제 Gemini API 키
- **Environment**: Production, Preview, Development 모두 선택

### 3. API 키 발급 방법

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 API 키를 복사하여 Vercel 환경변수에 설정

## 배포 후 확인사항

- 환경변수가 올바르게 설정되었는지 확인
- `/api/chat` 엔드포인트가 정상 작동하는지 테스트
- Gemini API 응답이 정상적으로 오는지 확인

## 문제 해결

### 빌드 오류 시
- `package-lock.json` 파일이 있다면 삭제
- `yarn.lock`만 사용하도록 설정

### API 오류 시
- 환경변수가 올바르게 설정되었는지 확인
- Gemini API 키가 유효한지 확인
- API 사용량 한도 확인
