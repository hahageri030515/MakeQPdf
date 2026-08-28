import { useState, useRef } from 'react';
import kobi_1 from './assets/images/kobi_1.png';
import kobi_2 from './assets/images/kobi_2.png';


export default function PdfUploader() {
  const [file, setFile] = useState([]);
  const fileInputRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [downloadFilename, setDownloadFilename] = useState("문제집.pdf");
  const [examMode, setExamMode] = useState(false);
  const [difficulty, setDifficulty] = useState("중");



  function handleFileChange(e) {
    setFile(Array.from(e.target.files));
    setDownloadUrl(null); // 새 파일 선택하면 이전 다운로드 링크 초기화
  }

  function triggerFileSelect() {
    fileInputRef.current.click(); // 숨겨진 input을 대신 클릭해줌
  }

  function handleNumChange(e) {
    const value = Number(e.target.value);
    setNumQuestions(value);
  }

  async function handleUpload() {
    if (!file) {
      alert("PDF 파일을 먼저 선택해 주세요.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    file.forEach((f) => formData.append("files", f)); // 같은 키로 여러 번 append
    formData.append("num_questions", numQuestions);
    
    formData.append("exam_mode", examMode) //전송.
    formData.append("difficulty", difficulty)

    try {
      const response = await fetch("https://makeqpdfbackend.onrender.com/files/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("서버 처리 실패");
      }

      /*타이틀 변경 관련.*/
      const disposition = response.headers.get("Content-Disposition");
      let filename = "문제집.pdf";
      
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

      setDownloadFilename(filename);

      /*url관련.*/
      const blob = await response.blob(); // JSON 대신 blob(파일 데이터)로 받기
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

    } catch (error) {
      console.error("전송 실패:", error);
      alert("처리 중 오류가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  }

//ui 꾸미는 곳
  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      <h1>KOBI</h1>
      <h4>~문제집 생성기~</h4>

      <input type="file" accept=".pdf" multiple ref={fileInputRef}
      onChange={handleFileChange} style={{ display: 'none' }} />

      <button onClick={triggerFileSelect} style={{ position: 'absolute',
          top: '200px',
          left: '150px'}}>
        📁 PDF 파일 선택
      </button>

      {file.length > 0 && ( //파일 선택 관련
        <ul style={{ fontSize: '14px', marginTop: '8px',
          listStyle: 'none',  // 불릿 포인트 제거
          paddingLeft: 0,       // 왼쪽 여백도 같이 제거 (안 하면 빈 공간만 남음),
          position: 'absolute',
          top: '225px',        // input 아래쯤 고정 위치
          left: '170px'
         }}>
          {file.map((f, i) => (
            <li key={i}>{f.name}</li>
          ))}
        </ul>
      )}

      <div style={{  position: 'absolute',
          top: '395px',     
          left: '430px'}}> 
        <label>
          문제 개수: <strong>{numQuestions}개</strong>
        </label>
        <input
          type="range"
          min={3}
          max={30}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          style={{ width: '90%' }}
        />
        
      </div>

      <div style={{ position: 'absolute',
          top: '270px',     
          left: '460px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>난이도</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {["하", "중", "상"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: difficulty === level ? '2px solid #8B6F47' : '1px solid #ccc',
                backgroundColor: difficulty === level ? '#8B6F47' : 'white',
                color: difficulty === level ? 'white' : '#333',
                fontWeight: difficulty === level ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleUpload} disabled={isLoading} style={{ position: 'absolute', //생성 버튼
        bottom: '-100px', right: '150px' }}>
        {isLoading ? "문제집 생성 중..." : "문제집 생성하기"}
        
      </button>

      <img style={{ position: 'absolute', bottom: '-85px', right: '165px', width: '7%'}} //코비 사진.

      src={kobi_2}

      alt="" />

      {downloadUrl && (
        <div style={{ position: 'absolute', bottom: '-300px', right: '100px' }}>
          <a href={downloadUrl} download={downloadFilename}>
            <button style={{
              padding: '16px 32px',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#8B6F47',
              color: 'white',
              cursor: 'pointer'
            }}>
            📄 PDF 다운로드</button>
          </a>
          
        </div>
      )}
      

      <div style={{  position: 'absolute',
          top: '200px',        // input 아래쯤 고정 위치
          left: '360px', }}>
      <div 
        onClick={() => setExamMode(!examMode)}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '8px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <span style={{ 
          marginRight: '10px', 
          color: !examMode ? '#8B6F47' : '#aaa',
          fontWeight: !examMode ? 'bold' : 'normal'
        }}>
          📖 일반 학습 모드
        </span>

        {/* 스위치 몸체 */}
        <div style={{
          width: '50px',
          height: '26px',
          borderRadius: '13px',
          backgroundColor: examMode ? '#8B6F47' : '#ccc',
          position: 'relative',
          transition: 'background-color 0.2s'
        }}>
          {/* 동그란 손잡이 */}
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'white',
            position: 'absolute',
            top: '3px',
            left: examMode ? '27px' : '3px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }} />
        </div>

        <span style={{ 
          marginLeft: '10px', 
          color: examMode ? '#8B6F47' : '#aaa',
          fontWeight: examMode ? 'bold' : 'normal'
        }}>
          ⏱ 실전 모의고사 모드
        </span>
      </div>
    </div>

    </div>
    
  );
}
