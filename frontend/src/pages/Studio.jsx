import React, { useState, useEffect } from 'react';
import { uploadStudioPhotos, getStudioPhotoStatus } from '../api/services';
import '../styles/studio.css';

const Studio = () => {
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [currentStudioPhoto, setCurrentStudioPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Handle front photo selection
  const handleFrontPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle back photo selection
  const handleBackPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!frontPhoto || !backPhoto) {
      setError('앞면과 뒷면 사진을 모두 업로드해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadStudioPhotos(frontPhoto, backPhoto);
      setCurrentStudioPhoto(result);
      setIsProcessing(true);

      // Start polling for status
      pollStatus(result.studio_photo_id);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('업로드 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for processing status
  const pollStatus = async (studioPhotoId) => {
    try {
      const status = await getStudioPhotoStatus(studioPhotoId);

      if (status.processing_status === 'completed') {
        setCurrentStudioPhoto(status);
        setIsProcessing(false);
      } else if (status.processing_status === 'failed') {
        setError('처리 실패: ' + (status.ai_metadata?.error || '알 수 없는 오류'));
        setIsProcessing(false);
      } else {
        // Continue polling every 2 seconds
        setTimeout(() => pollStatus(studioPhotoId), 2000);
      }
    } catch (err) {
      console.error('Status check failed:', err);
      setError('상태 확인 실패');
      setIsProcessing(false);
    }
  };

  // Reset all
  const handleReset = () => {
    setFrontPhoto(null);
    setBackPhoto(null);
    setFrontPreview(null);
    setBackPreview(null);
    setCurrentStudioPhoto(null);
    setIsProcessing(false);
    setError(null);
  };

  // Get base URL for images
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_BASE_URL || ''}${path}`;
  };

  return (
    <div className="studio-container">
      <div className="studio-header">
        <h1>스튜디오 포토</h1>
        <p>앞면과 뒷면 사진을 업로드하면 AI가 자동으로 합성 및 누끼 작업을 진행합니다</p>
      </div>

      {error && (
        <div className="studio-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="studio-content">
        {/* Upload Section */}
        <div className="studio-upload-section">
          <h2>사진 업로드</h2>

          <div className="studio-upload-grid">
            {/* Front Photo Upload */}
            <div className="studio-upload-box">
              <label htmlFor="front-photo" className="studio-upload-label">
                {frontPreview ? (
                  <img src={frontPreview} alt="앞면 미리보기" className="studio-preview-img" />
                ) : (
                  <div className="studio-upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>앞면 사진 선택</span>
                  </div>
                )}
              </label>
              <input
                id="front-photo"
                type="file"
                accept="image/*"
                onChange={handleFrontPhotoChange}
                className="studio-upload-input"
              />
              <p className="studio-upload-hint">앞면 사진</p>
            </div>

            {/* Back Photo Upload */}
            <div className="studio-upload-box">
              <label htmlFor="back-photo" className="studio-upload-label">
                {backPreview ? (
                  <img src={backPreview} alt="뒷면 미리보기" className="studio-preview-img" />
                ) : (
                  <div className="studio-upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>뒷면 사진 선택</span>
                  </div>
                )}
              </label>
              <input
                id="back-photo"
                type="file"
                accept="image/*"
                onChange={handleBackPhotoChange}
                className="studio-upload-input"
              />
              <p className="studio-upload-hint">뒷면 사진</p>
            </div>
          </div>

          <div className="studio-actions">
            <button
              onClick={handleUpload}
              disabled={!frontPhoto || !backPhoto || isUploading || isProcessing}
              className="studio-btn studio-btn-primary"
            >
              {isUploading ? '업로드 중...' : '업로드 및 처리 시작'}
            </button>
            <button
              onClick={handleReset}
              className="studio-btn studio-btn-secondary"
              disabled={isUploading || isProcessing}
            >
              초기화
            </button>
          </div>
        </div>

        {/* Results Section */}
        {currentStudioPhoto && (
          <div className="studio-results-section">
            <h2>처리 결과</h2>

            <div className="studio-results-grid">
              {/* Combined Image */}
              <div className="studio-result-box">
                <h3>합성 이미지</h3>
                {isProcessing && !currentStudioPhoto.combined_image_url ? (
                  <div className="studio-loading">
                    <div className="studio-spinner"></div>
                    <p>앞면과 뒷면을 합성하는 중...</p>
                  </div>
                ) : currentStudioPhoto.combined_image_url ? (
                  <img
                    src={getImageUrl(currentStudioPhoto.combined_image_url)}
                    alt="합성 이미지"
                    className="studio-result-img"
                  />
                ) : null}
              </div>

              {/* Processed Image (Background Removed) */}
              <div className="studio-result-box">
                <h3>누끼 이미지</h3>
                {isProcessing && !currentStudioPhoto.processed_image_url ? (
                  <div className="studio-loading">
                    <div className="studio-spinner"></div>
                    <p>배경 제거 중...</p>
                  </div>
                ) : currentStudioPhoto.processed_image_url ? (
                  <div className="studio-result-with-bg">
                    <img
                      src={getImageUrl(currentStudioPhoto.processed_image_url)}
                      alt="누끼 이미지"
                      className="studio-result-img"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {currentStudioPhoto.processing_status === 'completed' && (
              <div className="studio-success-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>처리 완료!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;