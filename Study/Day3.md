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







