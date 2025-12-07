import React, { useState, useRef, useEffect } from 'react';
import { Camera, Move, ZoomIn, ZoomOut, Upload } from 'lucide-react';

const SIZES = [
  { id: '16x20', width: 16, height: 20, label: '16" × 20"', orientation: 'portrait' },
  { id: '19.5x27.5', width: 19.5, height: 27.5, label: '19.5" × 27.5"', orientation: 'portrait' },
  { id: '24x36', width: 24, height: 36, label: '24" × 36"', orientation: 'landscape' }
];

export default function IkonhausAR() {
  const [step, setStep] = useState('upload');
  const [portraitImage, setPortraitImage] = useState(null);
  const [landscapeImage, setLandscapeImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [artworkPlaced, setArtworkPlaced] = useState(false);
  const [artworkPosition, setArtworkPosition] = useState({ x: 50, y: 50 });
  const [artworkScale, setArtworkScale] = useState(1);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const portraitInputRef = useRef(null);
  const landscapeInputRef = useRef(null);

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

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera access. Please try Chrome, Safari, or Firefox on mobile.');
      return;
    }

    try {
      console.log('Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Force video to play
        try {
          await videoRef.current.play();
          console.log('Video playing');
        } catch (playErr) {
          console.error('Video play error:', playErr);
        }
      }
      
      // Small delay to ensure video is ready
      setTimeout(() => {
        setStep('camera');
        console.log('Switched to camera view');
      }, 200);
    } catch (err) {
      console.error('Camera error:', err);
      alert(`Camera Error: ${err.message}\n\nPlease enable camera permissions in your browser settings.`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setStep('preview');
    setArtworkPlaced(false);
  };

  const placeArtwork = (e) => {
    if (step !== 'camera') return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    console.log('Placing artwork at:', x, y);
    setArtworkPosition({ x, y });
    setArtworkPlaced(true);
  };

  const getArtworkDimensions = () => {
    const scale = 250 / 36;
    const pixelWidth = selectedSize.width * scale * artworkScale;
    const pixelHeight = selectedSize.height * scale * artworkScale;
    return { width: pixelWidth, height: pixelHeight };
  };

  const dimensions = getArtworkDimensions();
  const currentImage = selectedSize.orientation === 'portrait' ? portraitImage : landscapeImage;

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (step === 'upload') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ maxWidth: '32rem', width: '100%', background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Ikonhaus Artworks</h1>
            <p style={{ color: '#64748b' }}>Upload your artwork to visualize it on your wall</p>
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
              style={{ width: '100%', border: '2px dashed #cbd5e1', borderRadius: '0.75rem', padding: '2rem', background: 'transparent', cursor: 'pointer' }}
            >
              {portraitImage ? (
                <img src={portraitImage} alt="Portrait preview" style={{ width: '8rem', height: '10rem', objectFit: 'cover', margin: '0 auto', borderRadius: '0.25rem' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} size={32} />
                  <p style={{ color: '#64748b' }}>Click to upload portrait image</p>
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
              style={{ width: '100%', border: '2px dashed #cbd5e1', borderRadius: '0.75rem', padding: '2rem', background: 'transparent', cursor: 'pointer' }}
            >
              {landscapeImage ? (
                <img src={landscapeImage} alt="Landscape preview" style={{ width: '12rem', height: '8rem', objectFit: 'cover', margin: '0 auto', borderRadius: '0.25rem' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} size={32} />
                  <p style={{ color: '#64748b' }}>Click to upload landscape image</p>
                </div>
              )}
            </button>
          </div>

          <button
            onClick={() => setStep('preview')}
            disabled={!portraitImage || !landscapeImage}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: portraitImage && landscapeImage ? 'pointer' : 'not-allowed',
              background: portraitImage && landscapeImage ? '#0f172a' : '#cbd5e1',
              color: portraitImage && landscapeImage ? 'white' : '#64748b'
            }}
          >
            Continue to AR
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ maxWidth: '28rem', width: '100%', background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Ikonhaus Artworks</h1>
            <p style={{ color: '#64748b' }}>Try artwork on your wall</p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={portraitImage} 
              alt="Preview" 
              style={{ width: '12rem', height: '16rem', objectFit: 'cover', margin: '0 auto', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          <button
            onClick={startCamera}
            style={{
              width: '100%',
              background: '#0f172a',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <Camera size={24} />
            Start AR Experience
          </button>

          <button
            onClick={() => setStep('upload')}
            style={{
              width: '100%',
              color: '#64748b',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Change Artwork
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'black', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          backgroundColor: '#000',
          transform: 'scaleX(-1)'
        }}
        onLoadedMetadata={(e) => {
          console.log('Video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight);
          e.target.play().catch(err => console.error('Play error:', err));
        }}
        onCanPlay={(e) => {
          console.log('Video can play');
          e.target.play().catch(err => console.error('Play error:', err));
        }}
      />

      <div 
        style={{ position: 'absolute', inset: 0, cursor: 'crosshair', touchAction: 'none' }}
        onClick={placeArtwork}
        onTouchEnd={placeArtwork}
      >
        {artworkPlaced && currentImage && (
          <div
            style={{
              position: 'absolute',
              left: `${artworkPosition.x}%`,
              top: `${artworkPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transition: 'all 0.2s',
              pointerEvents: 'none'
            }}
          >
            <img
              src={currentImage}
              alt="Artwork"
              style={{ width: '100%', height: '100%', objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            />
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', padding: '1rem', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem', margin: 0 }}>Ikonhaus AR</h2>
          <button
            onClick={stopCamera}
            style={{
              color: 'white',
              background: '#dc2626',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {!artworkPlaced && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 5 }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(4px)' }}>
            <Move style={{ margin: '0 auto 0.5rem' }} size={32} />
            <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>Tap anywhere on the wall</p>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0 }}>to place your artwork</p>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '1rem', paddingBottom: '2rem', zIndex: 10 }}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', overflowX: 'auto' }}>
          {SIZES.map(size => (
            <button
              key={size.id}
              onClick={() => {
                setSelectedSize(size);
                setArtworkPlaced(false);
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: selectedSize.id === size.id ? 'white' : 'rgba(255,255,255,0.2)',
                color: selectedSize.id === size.id ? 'black' : 'white'
              }}
            >
              {size.label}
            </button>
          ))}
        </div>

        {artworkPlaced && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setArtworkScale(Math.max(0.5, artworkScale - 0.1))}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ZoomOut size={20} />
            </button>
            <span style={{ color: 'white', fontWeight: '500', padding: '0 1rem' }}>
              {Math.round(artworkScale * 100)}%
            </span>
            <button
              onClick={() => setArtworkScale(Math.min(2, artworkScale + 0.1))}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ZoomIn size={20} />
            </button>
          </div>
        )}

        {artworkPlaced && (
          <button 
            onClick={() => window.open('https://ikonhaus.com', '_blank')}
            style={{
              width: '100%',
              background: 'white',
              color: 'black',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Shop This Artwork
          </button>
        )}
      </div>
    </div>
  );
}
