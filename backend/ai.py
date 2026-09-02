
from dotenv import load_dotenv
import os, time

result = load_dotenv()
print("load_dotenv 성공 여부:", result)
print("현재 작업 디렉토리:", os.getcwd())
#print("읽어온 키:", os.environ.get("GOOGLE_API_KEY"))


from google import genai

client = genai.Client()
from google.genai import types

response_schema = {
    "type": "OBJECT",
    "properties": {
        "document_info": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING"},
                "theme": {
                    "type": "OBJECT",
                    "properties": {
                        "primary_color": {"type": "STRING"},
                        "secondary_color": {"type": "STRING"},
                        "background_color": {"type": "STRING"},
                        "text_color": {"type": "STRING"},
                        "concept": {"type": "STRING"}
                    },
                    "required": ["primary_color", "secondary_color", "background_color", "text_color"]
                }
            },
            "required": ["title", "theme"]
        },
        "quiz_data": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "page": {"type": "INTEGER"},
                    "page_type": {"type": "STRING", "enum": ["problem_page", "explanation_page"]},
                    "problem_number": {"type": "INTEGER"},
                    "question": {"type": "STRING"},
                    "statements": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "ㄱ, ㄴ, ㄷ 같은 개별 보기 항목 \
                        (해당되는 문제 유형에만 사용, 없으면 빈 배열)"
                        },
                    "options": {"type": "ARRAY", "items": {"type": "STRING"}},
                    "answer": {"type": "STRING"},
                    "character": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "profile": {"type": "STRING"}
                        }
                    },
                    "explanation": {"type": "STRING"}
                },
                "required": ["page", "page_type", "problem_number"]
            }
        }
    },
    "required": ["document_info", "quiz_data"]
}

def make_problem(#image, 
        text, num_questions=3, difficulty = "중", exam_mode = False, max_retries=7):

    base_delay = 2
    print(f"난이도: {difficulty}")
    
    print(f"{exam_mode}, make_problem")
    mode_instruction = ""
    if exam_mode:
        mode_instruction = f"""
        이건 실전 모의고사 형식이야. document_info의 title은 "실전 모의고사" 느낌으로 지어줘 
        (예: "OO과목 실전 모의고사"). 
        quiz_data 순서는 모든 문제(problem_page)를 먼저 다 배치하고,
        그 다음에 정답 및 해설(explanation_page)을 모아서 뒤에 배치해줘.
        해설 첫번째 문장에는 몇 번 문제의 해설인지 번호를 포함해줘.
        """
    else:
        mode_instruction = "문제집은 문제, 해설, 문제, 해설 이런 순서로 나오게 해줘."

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=[#list(image), 
                    f"참고 텍스트:[{text}] 이 텍스트는 PDF에서 추출한 거라, 레이아웃 특성상 \
                                문장/단어 순서가 부자연스럽게 섞여 \
                                있을 수 있어. 그런 경우 문맥을 보고 \
                                자연스럽게 재구성해서 이해해줘. 이 텍스트를 \
                                보고 pdf형식의 예상 문제집을 만들어주면 돼.\
                                난이도는 '{difficulty}' 수준으로 맞춰줘.\
                                  {mode_instruction}\
                                  총 {num_questions}개의 문제를 내줘.\
                                  해설을 케릭터가 알려주는 말투로 해줘. '코비'라는 부엉이 캐릭터야. \
                                늦은 밤까지 공부하는 학생들을 도와주는 차분하고 다정한 선배 같은 존재야.\
                                원칙: - 학생이 틀려도 절대 혼내거나 조급하게 굴지 않는다 \
                                - 담백하고 안정적인 어조를 유지한다 (과한 감탄사나 이모지 남발 X)\
                                - 설명은 명확하되, 친근한 구어체로 전달한다\
                                - 정답일 땐 담백하게 인정, 오답일 땐 원인을 짚고 다시 설명한다 케릭터는 이런 느낌이고,\
                                  해설은 다음 요소를 반드시 포함해서 최소 4~5문장 이상으로 풍부하게 작성해줘: \
                                    1) 정답이 왜 맞는지에 대한 명확한 근거 \
                                    2) 오답 선택지들이 왜 틀렸는지 각각 간단히 짚어주기 \
                                    3) 관련된 배경 개념이나 원리를 좀 더 깊이 있게 설명 \
                                    4) 실제 시험이나 실무에서 헷갈리기 쉬운 포인트가 있다면 짚어주기 \
                                  html문자열로 pdf를 만들꺼라 문제/보기/정답/해설을 명확히 구분해서 출력해줘. JSON 형식으로."],
                 config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=response_schema)
            )
            return response
        except Exception as e:
            if attempt < max_retries - 1:
                sleep_time = min(base_delay * (2 ** attempt), 30)  # 최대 30초로 상한 걸기
                print(f"재시도 중... ({attempt + 1}/{max_retries}), {sleep_time}초 대기")
                time.sleep(sleep_time)
            else:
                raise e
    return response

