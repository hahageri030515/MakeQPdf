# Day2

이제 변수와 매개변수의 공부로 넘어간다.
파이썬이나 다른 언어에서는 물론 그냥 처음부터
값을 지정해주기도 했지만, input으로 입력 받는 경우가 있었고,
입력창이 뜨면 입력했었는데 여기는 특이하게
'주소창'에 있는 값을 받아오게 되어있다.


from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}
```

근데 이건 이제 주소창에서 123, 즉 정수를 입력하든 '최한결', 즉 문자열을
입력하든 뭐 다 똑같다.
그.러.나, 다른 언어에서도 제공하듯, 타입 지정이 가능하다.

`async def read_item(item_id: int):`

int형, 즉 정수라고 써주면 된다.
이렇게 한다음 '문자열이다'를 입력하면 어떻게 될까?
```
{"detail":[{"type":"int_parsing","loc":["path","item_id"],
"msg":"Input should be a valid integer, unable to parse string as an integer","input":"문자열이다"}]}
```
이런식으로 오류 메세지가 출력된다.

