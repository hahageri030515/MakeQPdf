# Day10

어느덧 Day10이다...

일단 오늘의 목표를 정해보자.
문제 수를 지정, pdf를 여러 개 추가할 수 있게 하는 것과 pdf만 올리는 게 가능하도록 지정하기.
을 우선 오늘의 목표로 잡아보자.

확장 기능으로 pdf뿐만 아니라 요구 텍스트나 음성도 첨부, 특히 텍스트.
또, 난이도 지정.
같은 기능들도 구상 중이나 우선 가장 필요해보이는 것들부터!

일단 문제 수 지정 기능은 생각보다 간단해서 금방 끝났다.
UI 슬라이더로 3~30해서 정수 값을 백엔드로 보내면, 백엔드 ai 프롬프트만 변수로 치환하면되니까.

근데, 갑자기 제목을 문제집에 맞게 변경하고 싶어서 하는 중인데
생각보다 고전중이다...
벡엔드에서 html조립할때 title부분만 빼가지고 문자열을 프론트엔드로 가져와서 다운로드 부분에서 제목을
바꿔줘야되는데 문자열이 생각보다 뭐가 오류가 많다ㅠ.

Utf-8인코딩 문제가 지금 생긴 문제..
`const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/);`

백엔드에서 프론트엔드로 문자열을 보낼 때, 문자열이 내가 생각했던 문자열 대로 오는 게 아니라.
`attachment; filename*=UTF-8''%EC%BB%B4%ED%93%A8%ED%84%B0%20%EA%B5%AC%EC%A1%B0...`
이런 식으로 아주 많이 바뀌어서 오는 거 같다.
근데,
`%EC%BB%B4%ED%93%A8%ED%84%B0%20%EA%B5%AC%EC%A1%B0...`
이 부분만 필요하기 때문에 추출 작업이 필요하다.
악... 근데 저런 식으로 바뀌어서 오는 경우는 한글이 섞여 있을 때만,
보편적으로 적용되는 코드를 짜야 되기 떄문에 ai의 힘을 빌렸다.
```
if (disposition) {
  // 1. 표준 UTF-8 파일명 추출 (filename*=utf-8''이름)
  const utf8Match = disposition.match(/filename\*=utf-8''([^;\n]*)/i);
  if (utf8Match && utf8Match[1]) {
    filename = decodeURIComponent(utf8Match[1]);
  } else {
    // 2. UTF-8 규격이 없을 때 일반 파일명 추출 (filename="이름")
    const asciiMatch = disposition.match(/filename="?([^;\n"]*)"?/i);
    if (asciiMatch && asciiMatch[1]) {
      filename = asciiMatch[1];
    }
  }
}
```
한글이 있을때, 없을때로 나누어서 처리해주는 모양. -> 완성형.

으으으 오늘 저 제목 때문에 너무 시간을 많이 써서 힘들다. 나머지는 나중에.
다음에 할 꺼.->pdf를 여러 개 추가할 수 있게 하는 것과 pdf만 올리는 게 가능하도록 지정하기!
