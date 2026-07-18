# Fastapi에 대해 공부를 시작.
뭔가 이름이 api를 빠르게 실행하는? 도구이지 않을까...?

공부를 하려면 개발환경을 마련해야한다.

Visual Studio로 할꺼고.
문서/앱개발/fastapi공부/ 안에 만들기로 했다.

구글에 fastapi개발 첫걸음을 보니.
기초 main 코드가 있어서 출력해봤다.

from fastapi import FastAPI

app = FastAPI()

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}
```
    
이 코드는 
결국 우리 프로그래머들이 좋아하는
'Hello World' 출력이다.
FastAPI()라는게 본체 인스턴스이고,

@app.get("/")은 루트경로에 접속하면~ 이라는 조건문.

async~ 는 비동기 함수란다. 비동기란 다른 것들과 동시 실행. 병렬 회로같은거임.

그리고 마지막 코드는 딕셔너리 형태인데 FASTAPI()에서 자동으로 메세지로 바꾼다고 한다.


근데, fastapi는 프레임워크고 서버는 따로 준비를 해야되서
uvicorn를 다운받고 터미널에서 실행했다.
많은 오류가 발생했는데,
그중 한가지
파이썬이 여러 개 깔려있는게 경로 지정에 있어 오류가 있었다.
venv라는 가상환경 = 폴더를 만들어 헷갈리지 않게함. `venv\Scripts\activate`

그리고, venv폴더가 너무 수정많이 되어서
서버를 여는 코드인
uvicorn를 실행하면 자꾸 재시작되는 게 있었는데
`uvicorn main:app --reload`라는 코드가 뭔가 수정되면 서버 재시작, 즉 뭔가 수정했을 때 계속
수동으로 서버 재시작은 번거로우니까 만든거 같은데 암튼, app이라는 폴더를 만들어주고
app이라는 폴더의 수정사항이 있을 경우에만 재시작 되도록 지정해주었다.[main.py]가 포함되어 있음.

`uvicorn app.main:app --reload --reload-dir app`

아 그리고 재밋는게
http://127.0.0.1:8000
여기 접속하면 로그에 액세스 로그가 찍힌다.
진짜 내가 만든 거구나 싶다~



