import React, { useState, useRef, useEffect } from 'react';
import { css } from '@emotion/react';

const slidesData = [
  {
    title: 'ממשק משתמש חדש',
    desc: 'עיצוב מודרני ונקי שמקל על הניווט והשימוש באפליקציה. חוויית משתמש משופרת עם אנימציות חלקות.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=300&fit=crop',
  },
  {
    title: 'מצב כהה',
    desc: 'כעת תוכלו לעבוד גם בשעות הערב עם מצב כהה נוח לעיניים. החלפה קלה בין מצב בהיר לכהה.',
    img: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=300&fit=crop',
  },
  {
    title: 'סנכרון בענן',
    desc: 'כל הנתונים שלכם מסונכרנים אוטומטית בענן. גישה מכל מכשיר, בכל זמן ומכל מקום.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop',
  },
  {
    title: 'ביצועים משופרים',
    desc: 'האפליקציה מהירה פי 3 מהגרסה הקודמת! אופטימיזציה מלאה לחוויית שימוש חלקה.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
  },
  {
    title: '333ביצועים משופרים',
    desc: 'האפליקציה מהירה פי 3 מהגרסה הקודמת! אופטימיזציה מלאה לחוויית שימוש חלקה.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
  },
];

const galleryStyle = css`
  direction: rtl;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  .open-btn {
    background: white;
    color: #e74c3c;
    border: 3px solid #e74c3c;
    padding: 15px 30px;
    font-size: 18px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
    transition: transform 0.2s;
    margin: 20px;
  }
  .open-btn:hover {
    background: #fee;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
  }
  .overlay {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6);
    z-index: 9999;
    backdrop-filter: blur(3px);
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s;
  }
  .overlay.active {
    display: flex;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .modal {
    background: white;
    border-radius: 20px;
    width: 90vw;
    max-width: 700px;
    max-height: 85vh;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    position: relative;
    animation: slideUp 0.3s;
    display: flex;
    flex-direction: column;
  }
  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .modal-header {
    background: linear-gradient(135deg, #4DB8A8 0%, #2D9687 100%);
    color: white;
    padding: 25px;
    border-radius: 20px 20px 0 0;
    text-align: center;
    position: relative;
  }
  .modal-header h2 {
    font-size: 28px;
    margin: 0;
  }
  .close-btn {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    font-size: 28px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover {
    background: rgba(255,255,255,0.3);
  }
  .gallery-container {
    padding: 30px;
    flex: 1;
    overflow-y: auto;
  }
  .slide {
    display: none;
    text-align: center;
    animation: fadeIn 0.3s;
  }
  .slide.active {
    display: block;
  }
  .slide img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 15px;
    margin-top: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .slide h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 24px;
  }
  .slide p {
    color: #666;
    line-height: 1.6;
    font-size: 16px;
  }
  .navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  .nav-btn {
    background: #4DB8A8;
    color: white;
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nav-btn:hover:not(:disabled) {
    background: #2D9687;
    transform: scale(1.1);
  }
  .nav-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.5;
  }
  .dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ddd;
    cursor: pointer;
    transition: all 0.2s;
  }
  .dot.active {
    background: #4DB8A8;
    width: 25px;
    border-radius: 5px;
  }
  .modal-footer {
    padding: 20px 30px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .dont-show-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s;
  }
  .dont-show-btn:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }
  .slide-counter {
    color: #666;
    font-size: 14px;
  }
`;

export const WhatsNewGallery: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, current]);

  const openModal = () => {
    if (dontShow) return;
    setOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setOpen(false);
    document.body.style.overflow = 'auto';
    setCurrent(0);
  };

  const prevSlide = () => setCurrent(c => Math.max(0, c - 1));
  const nextSlide = () => setCurrent(c => Math.min(slidesData.length - 1, c + 1));
  const goToSlide = (idx: number) => setCurrent(idx);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) closeModal();
  };

  const handleDontShow = () => {
    setDontShow(true);
    closeModal();
    window.alert('החלון "מה חדש" לא יוצג יותר בסשן הזה');
  };

  return (
    <div css={galleryStyle}>
      <button className="open-btn" onClick={openModal}>🎉 מה חדש?</button>
      <div
        className={`overlay${open ? ' active' : ''}`}
        ref={overlayRef}
        onClick={handleOverlayClick}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <button className="close-btn" onClick={closeModal}>×</button>
            <h2>✨ מה חדש באפליקציה</h2>
          </div>
          <div className="gallery-container">
            {slidesData.map((slide, idx) => (
              <div className={`slide${current === idx ? ' active' : ''}`} key={idx}>
                <h3>{slide.title}</h3>
                <p>{slide.desc}</p>
                <img src={slide.img} alt={`תכונה ${idx + 1}`} />
              </div>
            ))}
            <div className="navigation">
              <button className="nav-btn" onClick={prevSlide} disabled={current === 0}>→</button>
              <div className="dots">
                {slidesData.map((_, idx) => (
                  <div
                    key={idx}
                    className={`dot${current === idx ? ' active' : ''}`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>
              <button className="nav-btn" onClick={nextSlide} disabled={current === slidesData.length - 1}>←</button>
            </div>
          </div>
          <div className="modal-footer">
            <button className="dont-show-btn" onClick={handleDontShow}>אל תציג שוב</button>
            <span className="slide-counter">
              <span>{current + 1}</span> / <span>{slidesData.length}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewGallery;
