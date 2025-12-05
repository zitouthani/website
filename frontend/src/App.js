import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [professionalPhoto, setProfessionalPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [photoId, setPhotoId] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setProfessionalPhoto(null);
      setPhotoId(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setProfessionalPhoto(null);
      setPhotoId(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const generateProfessionalPhoto = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner une photo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${BACKEND_URL}/api/generate-professional-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes timeout
        }
      );

      if (response.data.success) {
        setProfessionalPhoto(`data:image/png;base64,${response.data.professional_image}`);
        setPhotoId(response.data.photo_id);
      } else {
        setError('Erreur lors de la génération de la photo');
      }
    } catch (err) {
      console.error('Error generating photo:', err);
      setError(
        err.response?.data?.detail || 
        'Erreur lors de la génération de la photo. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = () => {
    if (professionalPhoto) {
      const link = document.createElement('a');
      link.href = professionalPhoto;
      link.download = `professional-photo-${photoId || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProfessionalPhoto(null);
    setError(null);
    setPhotoId(null);
  };

  return (
    <div className="app" data-testid="app-container">
      {/* Header */}
      <header className="header" data-testid="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="logo-text">ProPhoto AI</h1>
          </div>
          <p className="header-subtitle">Générateur de Photos Professionnelles</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content" data-testid="main-content">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <h2 className="hero-title">Transformez votre selfie en photo professionnelle</h2>
            <p className="hero-description">
              Utilisez l'intelligence artificielle pour créer une photo de profil professionnelle 
              parfaite pour LinkedIn, votre CV ou vos réseaux professionnels.
            </p>
          </div>

          {/* Upload Section */}
          {!professionalPhoto && (
            <div className="upload-section" data-testid="upload-section">
              <div 
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                data-testid="upload-zone"
              >
                {previewUrl ? (
                  <div className="preview-container" data-testid="preview-container">
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                    <div className="preview-overlay">
                      <button 
                        onClick={reset} 
                        className="change-photo-btn"
                        data-testid="change-photo-btn"
                      >
                        Changer de photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder" data-testid="upload-placeholder">
                    <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="upload-text">Glissez-déposez votre selfie ici</p>
                    <p className="upload-subtext">ou</p>
                    <label htmlFor="file-upload" className="upload-button" data-testid="upload-button">
                      Parcourir les fichiers
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="file-input"
                        data-testid="file-input"
                      />
                    </label>
                    <p className="upload-hint">PNG, JPG, JPEG jusqu'à 10MB</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message" data-testid="error-message">
                  {error}
                </div>
              )}

              {selectedFile && (
                <button
                  onClick={generateProfessionalPhoto}
                  disabled={loading}
                  className="generate-button"
                  data-testid="generate-button"
                >
                  {loading ? (
                    <>
                      <svg className="loading-spinner" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Génération en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Générer ma photo professionnelle</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Result Section */}
          {professionalPhoto && (
            <div className="result-section" data-testid="result-section">
              <h3 className="result-title">Votre Photo Professionnelle</h3>
              
              <div className="comparison-container">
                {/* Original */}
                <div className="photo-card">
                  <div className="photo-header">
                    <h4>Photo Originale</h4>
                  </div>
                  <div className="photo-container">
                    <img src={previewUrl} alt="Original" className="result-image" />
                  </div>
                </div>

                {/* Arrow */}
                <div className="arrow-container">
                  <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Professional */}
                <div className="photo-card featured">
                  <div className="photo-header">
                    <h4>Photo Professionnelle</h4>
                    <span className="badge">IA Générée</span>
                  </div>
                  <div className="photo-container">
                    <img 
                      src={professionalPhoto} 
                      alt="Professional" 
                      className="result-image" 
                      data-testid="professional-photo"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button 
                  onClick={downloadPhoto} 
                  className="download-button"
                  data-testid="download-button"
                >
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger
                </button>
                <button 
                  onClick={reset} 
                  className="reset-button"
                  data-testid="reset-button"
                >
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Nouvelle photo
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          {!professionalPhoto && (
            <div className="features-section">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>IA Avancée</h3>
                <p>Technologie OpenAI pour des résultats professionnels</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3>Sécurisé</h3>
                <p>Vos photos sont traitées en toute sécurité</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>Rapide</h3>
                <p>Obtenez votre photo en moins d'une minute</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 ProPhoto AI - Générateur de Photos Professionnelles</p>
      </footer>
    </div>
  );
}

export default App;