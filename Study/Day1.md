Fastapi에 대해 공부를 시작.
뭔가 이름이 api를 빠르게 실행하는? 도구이지 않을까...?

공부를 하려면 개발환경을 마련해야한다.

Visual Studio로 할꺼고.
문서/앱개발/fastapi공부/ 안에 만들기로 했다.

구글에 fastapi개발 첫걸음을 보니.
기초 main 코드가 있어서 출력해봤다.

from fastapi import FastAPI

app = FastAPI()

`from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}`
    
이 코드는 



근데, fastapi는 프레임워크고 서버는 따로 준비를 해야되서
uvicorn를 다운받고 터미널에서 실행했다.
