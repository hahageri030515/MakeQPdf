# Day3
으으으... 이제 다시 정신 차리고 코딩공부를 제대로 사작해보고자 한다.

전에 공부하던 매개변수 마무리를 해보자.

오늘 목표는 쿼리 매개변수 모델까지!
```
from fastapi import FastAPI

app = FastAPI()


@app.get("/users/me")
async def read_user_me():
    return {"user_id": "the current user"}


@app.get("/users/{user_id}")
async def read_user(user_id: str):
    return {"user_id": user_id}
```
이 코드에서 유의할 점은 '순서'이다.
users/me가 먼저 오지 않으면,
{user_id}에 me값이 들어왔다고 인식되어 처리된다!
따라서, 아래와 같은 상황에서 항상 위의 것만 실행된다.
```
from fastapi import FastAPI

app = FastAPI()


@app.get("/users")
async def read_users():
    return ["Rick", "Morty"]


@app.get("/users")
async def read_users2():
    return ["Bean", "Elfo"]
```

매개변수로 값을 받아오기도 하지만,
사전정의를 하고 싶을 수도 있다.
이때 사용되는 것은 'Enum'이다.

```
from enum import Enum

from fastapi import FastAPI


class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"


app = FastAPI()


@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}
```
enum를 임포트해서 가져온다. 그리고 클래스를 선언하는데
str과 Enum를 상속한다! 그리고 값을 사전정의해준다.
`if model_name is ModelName.alexnet:` 요거로 값을 비교.

`model_name.value` 에서 `model_name`랑 str일 때는 동일하지만 그냥 관용적으로 붙이는 경우가
많다고 한다.

세 개 중 두개가 아니면 나머지 하나니까 마지막은 조건문 생략가능.

이 세개의 값이 아니라 다른 값이 입력되면 오류가 난다!
```
{
  "detail": [
    {
      "type": "enum",
      "loc": [
        "path",
        "model_name"
      ],
      "msg": "Input should be 'alexnet', 'resnet' or 'lenet'",
      "input": "123",
      "ctx": {
        "expected": "'alexnet', 'resnet' or 'lenet'"
      }
    }
  ]
}
```


### 이제이제 '쿼리'매개변수로 가보자.
'쿼리'란 URL에서 ?후에 나오고 &로 구분되는 키-값 쌍의 집합이다.

```
from fastapi import FastAPI

app = FastAPI()

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]


@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]
```

`http://127.0.0.1:8000/items/?skip=0&limit=10`에서 skip은 0값. limit은 10값을 가지고,
URL의 일부이므로, 자연스럽게 문자열이다.

쿼리 매개변수는 고정된 부분이 아니기 떄문에 '기본값'을 가질 수 있다.
위의 예에서는 skip=0, limit=10이라는 기본값을 가지고 있다. 가령,
`http://127.0.0.1:8000/items/`라고 경로를 입력하면
`http://127.0.0.1:8000/items/?skip=0&limit=10`라고 쓰는 것과 같다.
하지만,
`http://127.0.0.1:8000/items/?skip=20`로 지정하면, skip=20이 되고, limit은 기본값인 10이 된다.
`http://127.0.0.1:8000/items/?&limit=30`으로 limit만 값을 지정해줄 수도 있다.

다른예시,
```
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None):
    if q:
        return {"item_id": item_id, "q": q}
    return {"item_id": item_id}
```
우선 피라미터 이름이 item_id이므로, 함수에 있는 q는 쿼리 매개변수라고 자동 인식됨.
그리고 기본값이 None이므로 아무것도 입력안하면 쿼리고 기본값인 None으로 인식되어
아래 조건문을 거짓값을 띄게됨. (기본값을 지정하지 않으면 오류발생)
참고로, 매개변수 item_id의 기본값 지정은 안된다고 보면됨. 값이 들어와야 실행되는 구조라ㅇㅇ.

`http://127.0.0.1:8000/items/아이템값`은 `{"item_id":"아이템값"}`이 나옴.
쿼리값을 보고 싶은면 다음과 같이 입력.
`http://127.0.0.1:8000/items/아이템값?q=하이루` -> `{"item_id":"아이템값","q":"하이루"}`

bool형태 예시
```
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None, short: bool = False):
    item = {"item_id": item_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update(
            {"description": "This is an amazing item that has a long description"}
        )
    return item
```
다음에서 short값이 거짓일때 값이 추가가 되는데, 일단 기본값이 거짓이므로 추가,
그리고 참이될때는 추가가 안되는데, 참인 경우=> 1,True,true,on,yes

지금까지 쿼리 매개변수에 기본값을 다 넣어줬는데, 만약 넣지 않게 되면
'필수' 쿼리 매개변수가 된다. 쉽게 말하자면 값이 없으면 오류남!

쿼리 매개변수 배운거 종합 예시
```
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_user_item(
    item_id: str, needy: str, skip: int = 0, limit: int | None = None
):
    item = {"item_id": item_id, "needy": needy, "skip": skip, "limit": limit}
    return item
```
needy는 필수 문자형 쿼리 매개변수, skip은 기본이 0인 정수 쿼리 매개변수, limit은 선택 정수 쿼리 매개변수.
