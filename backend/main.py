from typing import Annotated
from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse

from pdf2image import convert_from_bytes
from pathlib import Path

from ai import make_problem

from weasyprint import HTML
from typing import List

import pdfplumber, io, json, uuid, re, random


BASE_DIR = Path(__file__).resolve().parent
output_dir = BASE_DIR / "outputs"
output_dir.mkdir(exist_ok=True)

app = FastAPI() #fastapi

#서버 보안관련.
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

def make_im_te(contents): #이미지, 텍스트 추출함수
    #이미지 추출
    images = convert_from_bytes(contents)
    
    # 텍스트 추출
    text_result = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_result += text + "\n"

    return images, text_result    

def data_title(result): #제목추출

    cleaned = result.strip().removeprefix("```json").removesuffix("```").strip() #정제 및 파싱 작업
    data = json.loads(cleaned)  # 문자열 → 파이썬 딕셔너리로 파싱
    title = data['document_info']['title']

    return title

circle_numbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"]
def data_assembly(result, exam_mode = False, time_limit = None): #html 조립.

    cleaned = result.strip().removeprefix("```json").removesuffix("```").strip() #정제 및 파싱 작업
    data = json.loads(cleaned)  # 문자열 → 파이썬 딕셔너리로 파싱
    
    html_content = f"<h1>{data['document_info']['title']}</h1>"

    if time_limit:
        html_content += f'<div class="time-notice">⏱ 제한 시간: {time_limit}분</div>'

    if exam_mode:
        # 문제만 먼저 전부 나열
        problems = [p for p in data['quiz_data'] if p['page_type'] == 'problem_page']
        explanations = [p for p in data['quiz_data'] if p['page_type'] == 'explanation_page']
        ordered_data = problems + explanations
    else:
        ordered_data = data['quiz_data']  # 기존 순서 그대로

    for page in ordered_data:
        kobi_image_path = BASE_DIR / "assets" / f"kobi_{random.randint(1, 3)}.png"
        if page['page_type'] == 'problem_page':
            html_content += f"<h2>문제 {page['problem_number']}</h2>"
            html_content += f"<p>{page['question']}</p>"

            if page.get('statements'):
                html_content += '<div class="statements">'
                for s in page['statements']:
                    html_content += f'<div class="statement-item">{s}</div>'
                html_content += '</div>'

            circle_chars = "①②③④⑤⑥⑦⑧⑨⑩"

            for i, opt in enumerate(page['options']):
                  # 앞부분의 "1. " "1) " "1." 같은 패턴 제거
                cleaned_opt = re.sub(r'^\d+[\.\)]\s*', '', opt.strip())
                cleaned_opt = re.sub(f'^[{circle_chars}]\s*', '', cleaned_opt)
                marker = circle_numbers[i] if i < len(circle_numbers) else f"{i+1})"
                html_content += f'<div class="option">{marker} {cleaned_opt}</div>'

            html_content += '<div class="page-break"></div>'
        elif page['page_type'] == 'explanation_page':
            html_content += f"<h2>해설</h2>"
            html_content += f'''
                            <div class="explanation-box">
                            <p>{page["explanation"]}</p>
                            <img src="file:///{kobi_image_path}" style="width: 40px; height: 60px; "float: left; margin-right: 10px;">
                            </div>
                            '''
            html_content += '<div class="page-break"></div>'

    return html_content

def html_style(html_content): #html 양식 디자인
    theme = {
    "primary_color": "#8B6F47",      # 코비 깃털 갈색
    "secondary_color": "#D4A574",    # 밝은 베이지/크림
    "background_color": "#FFFFFF",   # 인쇄용이니 흰색으로
    "text_color": "#4A3F35",         # 짙은 브라운
}

    style = f"""
<style>
  body {{
    font-family: 'Noto Sans KR', sans-serif;
    color: {theme['text_color']};
    line-height: 1.6;
    padding: 40px;
    background-color: {theme['background_color']};
  }}
  h1 {{
    border-bottom: 3px solid {theme['primary_color']};
    padding-bottom: 10px;
    color: {theme['primary_color']};
  }}
  h2 {{
    background-color: {theme['primary_color']};
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
  }}
  .question {{
    font-weight: bold;
    margin: 15px 0 10px;
  }}
  .option {{
    margin: 8px 0 8px 20px;
  }}
  .explanation-box {{
    background-color: #FDFBF7;
    border-left: 4px solid {theme['secondary_color']};
    border-radius: 4px;
    padding: 15px;
    margin-top: 15px;
  }}
  .page-break {{
    page-break-after: always;
  }}
  .time-notice {{
    background-color: #FDFBF7;
    border: 1px solid #D4A574;
    border-radius: 6px;
    padding: 10px 15px;
    margin-bottom: 20px;
    font-weight: bold;
    color: #8B6F47;
}}
</style>
"""
    return style + html_content

@app.post("/files/")
async def create_file(files: List[UploadFile], num_questions: int = Form(3), exam_mode: bool = Form(False), difficulty: str = Form("중")): #메인함수
    all_images = []
    all_text = ""

    for file in files:
        contents = await file.read()
        images, text_result = make_im_te(contents)
        all_images.extend(images)  # 이미지 리스트에 계속 추가
        all_text += text_result + "\n"  # 텍스트도 이어붙임

    result = make_problem(all_images, all_text, num_questions, difficulty, exam_mode)

    time_limit = int(num_questions * 1.5) if exam_mode else None

    html_content = html_style(data_assembly(result.text, exam_mode, time_limit))

    output_path = output_dir / f"{uuid.uuid4()}.pdf"
    HTML(string=html_content).write_pdf(str(output_path))

    safe_title = re.sub(r'[\\/:*?"<>|]', '', data_title(result.text)) #제목 불용어 제거.

    return FileResponse(
        path=output_path,
        filename=f"{safe_title}(KOBI).pdf",
        media_type="application/pdf"
    )


