# Day4
음 생각보다 한장한장이 오래걸린다..
오늘에야 말로 쿼리 변수 모델까지 열심히 달려보자!
아 그리고 fastapi의 목표점은 '경로 처리 설정' 까지!


자 그럼 오늘의 시작 파트는 '요청 본문'이다.
'요청 본문'이란 클라이언트가 api로 보내는 데이터이다!
이와 반대로, '응답 본문'이란 api가 클라이언트로 보내는 데이터.

Pydantic모델로 요청 본문을 선언한다.
다음 예시를 보자.
```
from fastapi import FastAPI
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


@app.post("/items/")
async def create_item(item: Item):
    return item
```
예를 들어, JSON 모델을 아래와 같이 선언.
```
{
    "name": "Foo",
    "description": "An optional description",
    "price": 45.2,
    "tax": 3.5
}
```
description과 tax는 기본값이 있으므로 안써도 그만 써도 그만.

근데 이게 주소창에서 바로 실행은 안되고 테스트하려고 docs 들어가서 입력해야된다.
다른 방법도 있는데 이게 제일 간단하고 편한듯ㅇㅇ.


이제 다시 쿼리 매개변수로 가보자!
쿼리 매개변수가 50자를 초과하지 않도록 강제하려고 한다.
```
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items/")
async def read_items(q: Annotated[str | None, Query(max_length=50)] = None):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```
Annotated와 Query를 새로 임포트.
`q: str | None = None`과 `q: Annotated[str | None] = None`은 같다.
그런데 그러면 Annotated의 존재의의가 사라진다. Annotated는 매개변수에 정보들을 더 추가할 수 있게 해준다.
그러므로, Query를 추가해보자.
`q: Annotated[str | None, Query(max_length=50)] = None`
아 그리고 Query매개변수이기 때문에 Query를 쓰는 거라고 한다.
비슷한 맥락으로,
`q: str | None = None`
`q: str | None = Query(default = None)`
두 개는 같지만 후자의 쪽이 명시적이라 후자가 더 나음.
그리고, 메타 데이터의 추가에도 더 용이하다.

그런데, Annotated 사용시 default는 사용불가한데...
`q: Annotated[str, Query(default = "사용불가1")] = "사용불가2"`
이러면 둘 중 누구를 실행할 지 알 수 없기 때문.

Annotated 사용이 권장된다. 여러모로 좋댄다.
아 그리고 str | None, 메타데이터1, 메타데이터2 ... 이런 형식이고,
str | None은 타입이 A 또는 B라는 느낌!


다중 값을 받는 방법도 있다.
리스트로 받는다. 아래 예시를 한번 봐보자.
```
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items/")
async def read_items(q: Annotated[list[str] | None, Query()] = None):
    query_items = {"q": q}
    return query_items
```
str 자리에 list[str]이 들어갔다. 
`http://localhost:8000/items/?q=한결&q=중앙대` 과 같이 q과 여러번 주어졌을 경우
```
{
  "q": [
    "한결",
    "중앙대"
  ]
}
```
이런 식으로 값을 받아올 수 있다.
None 자리에 `["기본", "값"]으로 기본값을 정의할 수도 있다.
또, 그냥 list라고 쓰면 타입 검사를 하지 않는다.

`Query(alias = '별칭-별칭')`
매개변수 이름에 특수 문자가 들어갈 때
별칭 매개변수를 사용가능하다.

`Query(deprecated=True)`
이제 사용 안하겠습니다~ 이런 느낌.

윽.. 이런 추가 메타데이터들은 나중에 필요할 떄마다 찾아봐도 되니까 넘어가고,
우선 다음파트!

이번에는 경로 매개변수와 숫자 검증 파트다.
경로 매개변수니까 Path, 쿼리할때는 Query를 임포트 해준다고 보면 편하다.

경로 매개변수는 악히 알다시피, 필수이다.(기본값 지정 의미없음.)

`Annotated[int, Path(title="The ID of the item to get", ge=1)]`
ge=1은 "greater than or equal"(크거나 같은) 정수형 숫자이다!
gt: greater than
ge: greater than or equal
lt: less than
le: less than or equal
만약 이 조건에 맞지 않으면 오류가 발생된다.


pydantic 모델을 사용하면, 변수들을 한번에 선언 가능하고 보기 좋게 정리 가능.
재사용도 용이한 장점이 있다.
```
from typing import Annotated, Literal

from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

app = FastAPI()


class FilterParams(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)
    order_by: Literal["created_at", "updated_at"] = "created_at"
    tags: list[str] = []


@app.get("/items/")
async def read_items(filter_query: Annotated[FilterParams, Query()]):
    return filter_query
```
filter_query는 쿼리 매개변수이고, 타입이 FilterParams라는 클래스로 지정됨.

`model_config = {"extra": "forbid"}`는 추가적인 데이터 받기 금지.
Field나 Literal 같은게 새로 생겼는데,
Field는 모델 필드에 제약을 걸때 사용된다.(Query, Path와 비슷하게 쓰면 될듯?)
Literal은 값의 범위를 제한, [ ] 안에 있는 값들로 제한한다!(엄청 빡빡하군.)


으아아아아.
드디어 쿼리 매개변수 모델까지 끝냈다. 이제 내일부터는 본문을 공부해보자!! 파이팅팅~










