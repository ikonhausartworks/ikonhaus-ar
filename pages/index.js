import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Maximize2, Minimize2, RotateCw, X } from 'lucide-react';
import Head from 'next/head';

const SIZES = [
  { id: '16x20', width: 16, height: 20, label: '16" × 20"', orientation: 'portrait' },
  { id: '19.5x27.5', width: 19.5, height: 27.5, label: '19.5" × 27.5"', orientation: 'portrait' },
  { id: '24x36', width: 24, height: 36, label: '24" × 36"', orientation: 'landscape' }
];

export default function IkonhausARv2() {
  const [step, setStep] = useState('upload');
  const [portraitImage, setPortraitImage] = useState(null);
  const [landscapeImage, setLandscapeImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [artworkPlaced, setArtworkPlaced] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [calibrationDistance, setCalibrationDistance] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const portraitInputRef = useRef(null);
  const landscapeInputRef = useRef(null);
  const arContainerRef = useRef(null);

  useEffect(() => {
    if (step === 'ar' && showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, showInstructions]);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'portrait') {
          setPortraitImage(event.target.result);
        } else {
          setLandscapeImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCalibration = () => {
    setStep('calibration');
  };

  const completeCalibration = (distance) => {
    setCalibrationDistance(distance);
    setShowInstructions(true);
    setStep('ar');
  };

  const currentImage = selectedSize.orientation === 'portrait' ? portraitImage : landscapeImage;

  // Calculate actual size based on calibration
  const getScaledDimensions = () => {
    if (!calibrationDistance) return { width: 200, height: 250 };
    
    // Base calculation: 1 inch ≈ 2.54cm, typical phone is ~6cm wide
    const pixelsPerInch = calibrationDistance === 'arm' ? 25 : 35;
    const width = selectedSize.width * pixelsPerInch * scale;
    const height = selectedSize.height * pixelsPerInch * scale;
    
    return { width, height };
  };

  const dimensions = getScaledDimensions();

  // Upload Screen
  if (step === 'upload') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ maxWidth: '32rem', width: '100%', background: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
              Ikonhaus AR
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>See your artwork on your wall in real size</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
              Portrait Artwork (16×20" & 19.5×27.5")
            </label>
            <input
              ref={portraitInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'portrait')}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => portraitInputRef.current?.click()}
              style={{ 
                width: '100%', 
                border: '2px dashed #cbd5e1', 
                borderRadius: '1rem', 
                padding: '2rem', 
                background: portraitImage ? '#f8fafc' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {portraitImage ? (
                <img src={portraitImage} alt="Portrait preview" style={{ width: '8rem', height: '10rem', objectFit: 'cover', margin: '0 auto', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} size={32} />
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Tap to upload portrait</p>
                </div>
              )}
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>
              Landscape Artwork (24×36")
            </label>
            <input
              ref={landscapeInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'landscape')}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => landscapeInputRef.current?.click()}
              style={{ 
                width: '100%', 
                border: '2px dashed #cbd5e1', 
                borderRadius: '1rem', 
                padding: '2rem', 
                background: landscapeImage ? '#f8fafc' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {landscapeImage ? (
                <img src={landscapeImage} alt="Landscape preview" style={{ width: '12rem', height: '8rem', objectFit: 'cover', margin: '0 auto', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} size={32} />
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Tap to upload landscape</p>
                </div>
              )}
            </button>
          </div>

          <button
            onClick={startCalibration}
            disabled={!portraitImage || !landscapeImage}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '1rem',
              fontWeight: '600',
              border: 'none',
              cursor: portraitImage && landscapeImage ? 'pointer' : 'not-allowed',
              background: portraitImage && landscapeImage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0',
              color: portraitImage && landscapeImage ? 'white' : '#94a3b8',
              fontSize: '1rem',
              transition: 'all 0.2s',
              boxShadow: portraitImage && landscapeImage ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            Continue to Setup
          </button>
        </div>
      </div>
    );
  }

  // Calibration Screen
  if (step === 'calibration') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ maxWidth: '28rem', width: '100%', background: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <RotateCw size={32} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
              Quick Setup
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              For accurate sizing, how far will you stand from the wall?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => completeCalibration('arm')}
              style={{
                padding: '1.25rem',
                borderRadius: '1rem',
                border: '2px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                Arm's Length (~2-3 feet)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Recommended for most walls
              </div>
            </button>

            <button
              onClick={() => completeCalibration('close')}
              style={{
                padding: '1.25rem',
                borderRadius: '1rem',
                border: '2px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                Close Up (~1 foot)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                For detailed viewing
              </div>
            </button>
          </div>

          <button
            onClick={() => setStep('upload')}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // AR View
  if (step === 'ar') {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <div 
          ref={arContainerRef}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: '#000',
            overflow: 'hidden',
            touchAction: 'none'
          }}
        >
          {/* Camera Video */}
          <video
            id="arVideo"
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Artwork Overlay */}
          {currentImage && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                pointerEvents: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <img
                src={currentImage}
                alt="Artwork"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}

          {/* Top Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            <h2 style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem', margin: 0 }}>
              Ikonhaus AR
            </h2>
            <button
              onClick={() => {
                const video = document.getElementById('arVideo');
                if (video && video.srcObject) {
                  video.srcObject.getTracks().forEach(track => track.stop());
                }
                setStep('upload');
                setArtworkPlaced(false);
              }}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <X size={16} />
              Exit
            </button>
          </div>

          {/* Instructions Overlay - Auto-hides after 3 seconds */}
          {showInstructions && (
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              maxWidth: '80%',
              zIndex: 5,
              animation: 'fadeOut 0.5s ease-in-out 2.5s forwards',
              pointerEvents: 'none'
            }}>
              <Camera style={{ margin: '0 auto 0.5rem' }} size={28} />
              <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                Point at your wall
              </p>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0 }}>
                Artwork shows at actual size
              </p>
            </div>
          )}

          {/* Bottom Controls */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            padding: '1.5rem',
            paddingBottom: '2.5rem',
            zIndex: 10
          }}>
            {/* Size Selector */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: '0.75rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: selectedSize.id === size.id ? 'white' : 'rgba(255,255,255,0.2)',
                    color: selectedSize.id === size.id ? '#0f172a' : 'white',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>

            {/* Scale Controls */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Minimize2 size={20} />
              </button>
              <span style={{ 
                color: 'white', 
                fontWeight: '600', 
                minWidth: '4rem',
                textAlign: 'center',
                fontSize: '1rem'
              }}>
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Maximize2 size={20} />
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={() => window.open('https://ikonhaus.com', '_blank')}
              style={{
                width: '100%',
                background: 'white',
                color: '#0f172a',
                padding: '1rem',
                borderRadius: '1rem',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transition: 'all 0.2s'
              }}
            >
              Shop This Artwork
            </button>
          </div>
        </div>

        {/* Initialize Camera */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const video = document.getElementById('arVideo');
              if (video && navigator.mediaDevices) {
                navigator.mediaDevices.getUserMedia({
                  video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }
                })
                .then(stream => {
                  video.srcObject = stream;
                  video.play();
                })
                .catch(err => {
                  console.error('Camera error:', err);
                  alert('Camera access denied. Please enable camera permissions.');
                });
              }
            })();
          `
        }} />
      </>
    );
  }

  return null;
}
