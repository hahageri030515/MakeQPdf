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
  const [showModeTip, setShowModeTip] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);


  function handleFileChange(e) {
    setFile(Array.from(e.target.files));
    setDownloadUrl(null); // 새 파일 선택하면 이전 다운로드 링크 초기화
  }

  function triggerFileSelect() {
    fileInputRef.current.click(); // 숨겨진 input을 대신 클릭해줌
  }

  function isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor;
    return /Instagram|FBAN|FBAV|KAKAOTALK|Line/i.test(ua);
  }

  function handleNumChange(e) {
    const value = Number(e.target.value);
    setNumQuestions(value);
  }

  async function handleUpload() {
    if (file.length === 0) {
      setErrorMessage("PDF 파일을 1개 이상 추가해줘!");
      setTimeout(() => setErrorMessage(null), 3000);
    return;
  }
    setErrorMessage(null);
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

      /*url관련.*/
      const blob = await response.blob(); // JSON 대신 blob(파일 데이터)로 받기
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(filename);

    } catch (error) {
      console.error("전송 실패:", error);
      alert("처리 중 오류가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  }

function handleDownloadClick() {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = downloadFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//ui 꾸미는 곳
  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>
        <h1 style={{ margin: '5px 0 0' }}>KOBI</h1>
        <h4 style={{ margin: '20px 0 0' }}>~문제집 생성기~</h4>
      </div>

      {/* 파일 선택 */}
      <div>
        <input 
          type="file" 
          accept=".pdf" 
          multiple 
          ref={fileInputRef}
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        <button onClick={triggerFileSelect}>
          📁 PDF 파일 추가
        </button>

        {file.length > 0 && (
          <div style={{
            height: '120px',
            width: '100%',
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '6px',
            padding: '8px 12px',
            marginTop: '8px',
            boxSizing: 'border-box'
          }}>
            <ul style={{ 
              fontSize: '14px', 
              margin: 0,
              listStyle: 'none',
              paddingLeft: 0
            }}>
              {file.map((f, i) => (
                <li key={i} style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 실전/일반 모드 스위치 */}
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => {
          setExamMode(!examMode);
          setShowModeTip(true);
          setTimeout(() => setShowModeTip(false), 15000);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <span style={{ 
          color: !examMode ? '#8B6F47' : '#aaa',
          fontWeight: !examMode ? 'bold' : 'normal'
        }}>
          📖 일반 학습 모드
        </span>

        <div style={{
          width: '50px',
          height: '26px',
          borderRadius: '13px',
          backgroundColor: examMode ? '#8B6F47' : '#ccc',
          position: 'relative',
          transition: 'background-color 0.2s',
          flexShrink: 0
        }}>
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
          color: examMode ? '#8B6F47' : '#aaa',
          fontWeight: examMode ? 'bold' : 'normal'
        }}>
          ⏱ 실전 모의고사 모드
        </span>
      </div>
       {showModeTip && (
    <div style={{
      marginTop: '8px',
      padding: '10px 14px',
      backgroundColor: '#FDFBF7',
      border: '1px solid #D4A574',
      borderRadius: '10px',
      fontSize: '13px',
      color: '#4A3F35',
      position: 'relative'
    }}>
      🦉 {examMode 
        ? "실전 모의고사 모드는 문제를 앞에 배치하고, 정답과 해설은 맨 뒤에 모아서 보여줘! 일반적인 문제지 형식이라고 생각하면 되고, 맨 앞에 제한 시간이 주어져 있어!" 
        : "일반 학습 모드는 문제-해설-문제-해설 구성으로 풀고 나서 바로 자세한 해설을 통해 학습할 수 있어! 공부용이라면 이 모드를 추천해!"}
    </div>
  )}
</div>

      {/* 난이도 */}
      <div>
        <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', textAlign: 'center' }}>난이도</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
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

      {/* 문제 개수 슬라이더 */}
      <div>
        <label>
          문제 개수: <strong>{numQuestions}개</strong>
        </label>
        <input
          type="range"
          min={3}
          max={30}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* 생성 버튼 + 코비 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px',  justifyContent: 'center' }}>
        <button onClick={handleUpload} disabled={isLoading}>
          {isLoading ? "문제집 생성 중..." : "문제집 생성하기"}
        </button>
        <img 
          src={kobi_2} 
          alt="" 
          style={{ width: '50px', height: 'auto' }} 
        />
      </div>

      {isLoading && (
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#FDFBF7',
        border: '1px solid #D4A574',
        borderRadius: '10px',
        fontSize: '13px',
        color: '#4A3F35',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <img src={kobi_2} alt="" style={{ width: '30px', height: 'auto', flexShrink: 0 }} />
        <span>
        🦉 문제집을 열심히 만들고 있어! 오랜만에 접속했다면 서버가 깨어나느라 
1분 정도 걸릴 수도 있어. 조금만 기다려줘, 곧 완성될 거야!
        </span>
      </div>
    )}

      {isInAppBrowser() && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FFF3CD',
          border: '1px solid #E5C158',
          borderRadius: '10px',
          fontSize: '13px',
          marginBottom: '12px'
        }}>
      🦉 인스타그램/카카오톡 안에서는 PDF 다운로드가 제한될 수 있어! 
      웹 링크를 복사해서 <strong>Chrome</strong>에서 실행해줘.
      </div>
    )}
    {errorMessage && (
    <div style={{
      padding: '10px 14px',
      backgroundColor: '#FFF0F0',
      border: '1px solid #E5A5A5',
      borderRadius: '10px',
      fontSize: '13px',
      color: '#8B3A3A'
    }}>
      🦉 {errorMessage}
    </div>
    )}


      {/* 다운로드 버튼 */}
      {downloadUrl && (
        <button onClick={handleDownloadClick} style={{
          padding: '16px 32px',
          fontSize: '20px',
          fontWeight: 'bold',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: '#8B6F47',
          color: 'white',
          cursor: 'pointer',
          width: '100%'
          }}>
          📄 PDF 다운로드
        </button>
      )}
    </div>
  );
}
