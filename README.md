# MakeQPdf(학습용 PDF 생성기)
사용자가 PDF를 업로드 후, 원하는 문제를 선택하면 그 문제를 변형하여 PDF로 제작해준다. 해설과 답도 제공.

## 배경 (Motivation)
- 대학 시험 공부를 준비하면서 주로 Cluade에게 요청했고, 실제로 많이 도움이 되었던 기능들을 웹앱으로 구현해보면 내가 공부할 때도 써볼 수 있고 다른 공부하는 학생들도 편하게 쓸 수 있을 것이라 생각해서 만들어보게 되었습니다. (실제 반복해온 워크플로우 있잖아, 그 얘기)
- 일단 영어pdf를 볼 수 없어 곤란해서 이를 한국어로 번역해 달라했습니다. / pdf파일이나 텍스트, 음성파일 등을 업로드하여 이를 바탕으로 문제 pdf 또는 요약본 pdf를 만들어 달라했습니다. / 문제pdf를 업로드하고 틀린 문제를 텍스트로 입력하여 틀린 문제만 뽑아 변형하여 문제pdf를 만들어 달라했습니다. / 문제pdf가 답이 나와있거나 해설이 없는 경우 문제 - 다음페이지 -  답+해설 - 다음페이지 ... 이런 식으로 문제pdf를 만들어 달라 했습니다.

## 주요 기능
- PDF 업로드 및 텍스트/문제 자동 파싱
- 오답 기반 변형문제 생성[정확히는 사용자가 원하는 문제]
- 과목별(확통/회계/OS) 맞춤 프롬프트
- 결과 PDF 다운로드

## 데모
![Uploading image.png…]()


## 기술 스택
- Frontend: React / Next.js
- Backend: FastAPI
- AI: Anthropic Claude API
- PDF 처리: pdfplumber, ReportLab

## 아키텍처
(간단한 다이어그램이나 플로우 설명)

## 실행 방법
\`\`\`bash
# 설치
git clone ...
pip install -r requirements.txt
npm install

# 실행
uvicorn main:app --reload
npm run dev
\`\`\`

## 환경변수
\`\`\`
ANTHROPIC_API_KEY=your_key_here
\`\`\`

## 폴더 구조
(나중에 채우기)

## 배운 점 / 회고
(개발하면서 부딪힌 문제, 해결 과정 — 이게 사실 면접에서 제일 많이 물어보는 부분이라 진짜 중요)

## 라이선스
