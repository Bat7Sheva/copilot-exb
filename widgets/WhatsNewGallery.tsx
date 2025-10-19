/** @jsx jsx */
import { css, jsx, React, defaultMessages as jimuCoreMessages } from 'jimu-core'
import ReactDOM from 'react-dom';
import { useState, useRef, useEffect } from 'react';

export interface IWhatsNewGalleryProps {
  isVisible: boolean;
  onClose?: () => void;        // סגירה זמנית (לחיצה על X / overlay)
  onDontShow?: () => void;     // אל תציג שוב (קבוע)
  formatMessage?: (id: string) => string;
}

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
    animation: fadeIn 0.25s;
  }
  .overlay.active {
    display: flex;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .modal {
    background: white;
    border-radius: 10px;
    width: 90vw;
    max-width: 720px;
    max-height: 86vh;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    position: relative;
    animation: slideUp 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  .modal-header {
    background: linear-gradient(135deg, #4DB8A8 0%, #2D9687 100%);
    color: white;
    padding: 18px 22px;
    border-radius: 10px 10px 0 0;
    text-align: center;
    position: relative;
  }
  .modal-header h2 { font-size: 20px; margin: 0; }
  .close-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(255,255,255,0.18);
    border: none;
    color: white;
    font-size: 20px;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .close-btn:hover { background: rgba(255,255,255,0.28); }
  .gallery-container { padding: 18px 22px 22px; flex: 1; overflow-y: auto; }
  .slide { display: none; text-align: center; animation: fadeIn 0.18s; }
  .slide.active { display: block; }
  .slide img { width: 100%; height: 260px; object-fit: cover; border-radius: 10px; margin-top: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
  .slide h3 { color: #222; margin-bottom: 8px; font-size: 18px; }
  .slide p { color: #555; line-height: 1.5; font-size: 14px; }
  .navigation { display:flex; justify-content:space-between; align-items:center; margin-top: 16px; padding-top: 14px; border-top: 1px solid #eee; }
  .nav-btn { background:#4DB8A8; color:white; border:none; width:40px; height:40px; border-radius:8px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:transform .12s; }
  .nav-btn:hover:not(:disabled){ transform: scale(1.05); background:#2D9687; }
  .nav-btn:disabled{ opacity:.5; cursor:not-allowed; background:#ccc; }
  .dots{ display:flex; gap:8px; }
  .dot{ width:10px; height:10px; border-radius:50%; background:#ddd; cursor:pointer; transition: all .12s; }
  .dot.active{ background:#4DB8A8; width:22px; border-radius:6px; }
  .modal-footer{ padding:12px 18px; border-top:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; }
  .dont-show-btn{ background:#e74c3c; color:#fff; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:13px; }
  .slide-counter{ color:#666; font-size:13px; }
`;

export const WhatsNewGallery: React.FC<IWhatsNewGalleryProps> = ({
  isVisible,
  onClose,
  onDontShow,
  formatMessage
}) => {
  const [current, setCurrent] = useState(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setCurrent(0);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(slidesData.length - 1, c + 1));
      if (e.key === 'Escape') (onClose || (() => {}))();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVisible, onClose]);

  const closeHandler = () => {
    if (onClose) onClose();
  };

  const dontShowHandler = () => {
    if (onDontShow) onDontShow();
    closeHandler();
  };

  const overlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) closeHandler();
  };

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div css={galleryStyle}>
      <div
        className="overlay active"
        ref={overlayRef}
        onClick={overlayClick}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <button className="close-btn" onClick={closeHandler} aria-label={formatMessage?.('close') || 'Close'}>×</button>
            <h2>{formatMessage?.('whatsNewTitle') || '✨ מה חדש באפליקציה'}</h2>
          </div>

          <div className="gallery-container">
            {slidesData.map((slide, idx) => (
              <div className={`slide${current === idx ? ' active' : ''}`} key={idx}>
                <h3>{slide.title}</h3>
                <p>{slide.desc}</p>
                <img src={slide.img} alt={slide.title} />
              </div>
            ))}

            <div className="navigation">
              <button className="nav-btn" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} aria-label="prev">←</button>

              <div className="dots" role="tablist" aria-label="slides">
                {slidesData.map((_, idx) => (
                  <div
                    key={idx}
                    className={`dot${current === idx ? ' active' : ''}`}
                    onClick={() => setCurrent(idx)}
                    role="tab"
                    aria-selected={current === idx}
                    aria-label={`slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button className="nav-btn" onClick={() => setCurrent(c => Math.min(slidesData.length - 1, c + 1))} disabled={current === slidesData.length - 1} aria-label="next">→</button>
            </div>
          </div>

          <div className="modal-footer">
            <button className="dont-show-btn" onClick={dontShowHandler}>{formatMessage?.('dontShowAgain') || 'אל תציג שוב'}</button>
            <div className="slide-counter">
              <span>{current + 1}</span> / <span>{slidesData.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsNewGallery;
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
