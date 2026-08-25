# Day9

이러니 저러니 해도 결국 만들면 그만이다.
React를 아직 초반이긴 한데 대충 뭔 느낌인지는 알았다.

필요한 기능을 설계하고 집어넣고,
문서를 받아와서 예상문제를 제공.
여기까지가 수순.

일단 디자인은 나중에 하고,
버튼을 눌러서 파일을 받아오는 기능을 구현해보자.

```
import { useState } from 'react';

export default function PdfUploader() {
  const [file, setFile] = useState(null);

  // 1. 사용자가 파일을 선택했을 때 실행
  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  // 2. 버튼을 눌렀을 때 서버로 전송
  async function handleUpload() {
    if (!file) {
      alert("PDF 파일을 먼저 선택해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // 파이썬 서버가 받을 Key 이름

    try {
      // 파이썬 서버 주소로 전송 (예: localhost:8000)
      const response = await fetch("http://localhost:8000/process-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("서버가 분석한 결과:", result);
      alert("서버 분석 완료! 콘솔 창을 확인하세요.");
    } catch (error) {
      console.error("전송 실패:", error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>PDF 서버 분석 요청</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        서버로 전송해서 분석하기
      </button>
    </div>
  );
}

```
ai의 도움을 받았는데 배울 점은 많다.



자, 그래서 pdf를 읽어서 문제집을 만드는 것까지는 성공했는데(우선, 1쪽 분량)
근데 텍스트로 밖에 못 받아온다는 것.
이거를 어떻게 다시 pdf로 만드느냐.

Weasyprint이라는 라이브러리가 있다. 이게 마크다운 형식, html로 뽑힌것을 pdf로 그대로 변환시켜준다고 한다.
그래서 제미나이에서 json형식으로 받아서 파싱 후 Weasyprint로 pdf를 제작하는 계획이다.

음, 파싱도 하고 html 디자인 기능도 써서 구현 할 수 있게 되었다.
제미나이를 프롬프트 짤 때 스키마 기능을 써서 대충 형식을 구현할 수 있다는 것도 알게 되었다.

이제 웹에서 전달을 딱 했을 때 이 만들어진 pdf를 다운로드 할 수 있는 기능을 만들어보자.

음 오늘 그래도 많이 진전이 있었다.
남은 기능은 문제 수를 지정하는 거-> 이건 간단해 보임.
pdf를 여러 개 추가할 수 있게 하는 거 -> 약간 복잡할 수도?

확장 기능: pdf뿐만 아니라 텍스트나 음성도 첨부할 수 있게 하면 좋을듯. 특히 텍스트.
또, 난이도 지정도 가능하면 좋겠다.

오늘은 수고 했고, 내일 다시 파보자. 웹명은 코비가 좋을듯. 마음에 들어.
