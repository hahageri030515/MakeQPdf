# Day6

이제부터는 좀 빠르고 실속있게 가보자.

일반적인 자료형을 나는 알고 있다. int나 float, str 같은거.
근데 다른 게 또 있다고 한다. 흠, 근데 이건 필요할 때 공부해도 될듯.

Cookie에 대해.
많이 들어보긴 했는디.
```
from typing import Annotated

from fastapi import Cookie, FastAPI

app = FastAPI()


@app.get("/items/")
async def read_items(ads_id: Annotated[str | None, Cookie()] = None):
    return {"ads_id": ads_id}
```
보면, ads_id라는 매개변수의 자료형을 str또는 None으로 기본값 None,이고 Cookie()라는
옵션을 하나 달았다. 무슨 뜻이지. 많이 본 느낌.
Query(), Path() 자리에 Cookie()가 있다. 즉, 쿠키 매개변수라는 것.

흠.. 일단 선언만 배우고, Header 라는 것도 똑같이 선언 가능하다.
그런데 헤더에는 추가 기능이 있는데,
자동변환이랑 중복 헤더다.
자동변환은 _을 -로 변환하고 첫번째 소문자를 대문자로 변환.
그리고 중복헤더는
`async def read_items(x_token: Annotated[list[str] | None, Header()] = None):`
이런 식으로 선언하고,
```
X-Token: foo
X-Token: bar
```
이런 식으로 전송하면
```
{
    "X-Token values": [
        "bar",
        "foo"
    ]
}
```
이런 결과가 나온 나는 것.

다른 것들 좀 스킵.

경로 처리.
```
@app.get()
@app.post()
@app.put()
@app.delete()
```

응답 상태 코드.
`@app.post("/items/", status_code=201)`

Form이라는 것도 있다. 정도.

중요한 것으로,, 파일 요청을 선언.

```
from typing import Annotated

from fastapi import FastAPI, File, UploadFile

app = FastAPI()


@app.post("/files/")
async def create_file(file: Annotated[bytes, File()]):
    return {"file_size": len(file)}


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}
```
UploadFile은 더 대용량 파일에 적합함.

async 메소드를 사용할 때, await를 사용해야함.
`contents = await myfile.read()`
await라는 건 파일을 읽는 동안, 기다리지 말고 다른 일을 하러가도 된다는 신호.

list를 사용해서 다중 파일 업로드를 지원함.


음, 오류 처리 방식은 필요할 때 공부하자.

경로 처리의 설정 관해.
응답 상태 코드는 기억안나면 단축 상수 활용하기.
태그를 달 수 있음.
요약, 설명 달 수 있음.
```
@app.post(
    "/items/",
    summary="Create an item",
    description="Create an item with all the information, name, description, price, tax and a set of unique tags",
)
```
응답에 대한 설명을 달 수 있음.
```
@app.post(
    "/items/",
    summary="Create an item",
    response_description="The created item",
)
```


후후, 일단 목표 지점까진 공부 완. 내가 볼 땐 파일 받아오는 게 제일 중요한 부분이었던 것 같다.
암튼 이제 다음으로 넘어가자.

