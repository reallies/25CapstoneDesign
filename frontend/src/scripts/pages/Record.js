import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import './Record.css';

const Record = () => {
  const navigate = useNavigate();

  // 이미지 미리보기를 위한 상태
  const [recordImageList, setRecordImageList] = useState([]);

  // 이미지 업로드 시 미리보기 URL 생성
  const handleRecordImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map(file => URL.createObjectURL(file));
    setRecordImageList(imagePreviews);
  };

  return (
    <div className="record-write-container">
      {/* 제목 */}
      <h2 className="record-write-title">기록 쓰기</h2>

      <div className="record-write-box">
        {/* 제목 입력 */}
        <div className="record-write-form-group">
          <label className="record-write-label">제목</label>
          <input
            type="text"
            placeholder="신나는 전주 여행"
            className="record-write-input"
          />
        </div>

        {/* 이미지 첨부 */}
        <div className="record-write-form-group">
          <label className="record-write-label">사진 첨부</label>
          <div className="record-photo-upload">
            <button
              className="record-upload-btn"
              onClick={() => document.getElementById("record-file-upload").click()}
            >
              내 PC
            </button>
            <input
              id="record-file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleRecordImageUpload}
              style={{ display: "none" }}
            />
            {/* 이미지 미리보기 */}
            <div className="record-photo-preview">
              {recordImageList.map((src, idx) => (
                <img key={idx} src={src} alt={`record-preview-${idx}`} className="record-preview-img" />
              ))}
            </div>
          </div>
        </div>

        {/* 본문 작성 */}
        <div className="record-write-form-group">
          <label className="record-write-label">글</label>
          <textarea
            placeholder="신나는 전주 여행을 다녀오며..."
            className="record-write-textarea"
          />
        </div>

        {/* 제출 / 취소 버튼 */}
        <div className="record-button-group">
          <button className="record-submit-btn">올리기</button>
          <button className="record-cancel-btn" onClick={() => navigate(-1)}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default Record;
