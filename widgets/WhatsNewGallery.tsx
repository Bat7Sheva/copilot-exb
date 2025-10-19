/** @jsx jsx */
import { css, jsx, React, defaultMessages as jimuCoreMessages } from 'jimu-core'
import ReactDOM from 'react-dom';
import { useState, useRef, useEffect } from 'react';

export interface IWhatsNewGalleryProps {
  isVisible: boolean;
  config: any;
  onClose?: () => void;        // סגירה זמנית (לחיצה על X / overlay)
  onDontShow?: () => void;     // אל תציג שוב (קבוע)
  formatMessage?: (id: string) => string;
}


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
    border-radius: 50%;
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
  .nav-btn { background:#4DB8A8; color:white; border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:transform .12s; }
  .nav-btn:hover:not(:disabled){ transform: scale(1.05); background:#2D9687; }
  .nav-btn:disabled{ opacity:.5; cursor:not-allowed; background:#ccc; }
  .dots{ display:flex; gap:8px; }
  .dot{ width:10px; height:10px; border-radius:50%; background:#ddd; cursor:pointer; transition: all .12s; }
  .dot.active{ background:#4DB8A8; width:22px; border-radius:6px; }
  .modal-footer{ padding:12px 18px; border-top:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; }
  .dont-show-btn{ background:#e74c3c; color:#fff; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:13px; }

  /* כפתור מקסימייז/ריסטור */
  .resize-btn {
    position: absolute;
    top: 12px;
    left: 56px; /* ליד כפתור ה-close (שכבר ב-left:12) */
    background: rgba(255,255,255,0.12);
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    transition: background .15s;
  }
  .resize-btn:hover { background: rgba(255,255,255,0.22); }

  /* ידית גרירה בפינה הימנית-תחתונה */
  .resizer {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 20px;
    height: 20px;
    cursor: se-resize;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .resizer:after {
    content: "";
    width: 10px;
    height: 10px;
    border-right: 2px solid rgba(0,0,0,0.15);
    border-bottom: 2px solid rgba(0,0,0,0.15);
    transform: rotate(45deg);
    opacity: 0.6;
  }

  /* עדכון גבול רדיוס כללי ל-10px (אם צריך) */
  .modal { border-radius: 10px; }
  .modal-header { border-radius: 10px 10px 0 0; }
`;

export const WhatsNewGallery: React.FC<IWhatsNewGalleryProps> = ({
  isVisible,
  config,
  onClose,
  onDontShow,
  formatMessage
}) => {

  const [current, setCurrent] = useState(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // new: size state (defaults from config or fallback)
  const defaultWidth = (config && config.defaultWidth) ? config.defaultWidth : '720px';
  const defaultHeight = (config && config.defaultHeight) ? config.defaultHeight : '520px';
  const [modalWidth, setModalWidth] = useState<string>(defaultWidth);
  const [modalHeight, setModalHeight] = useState<string>(defaultHeight);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const prevSizeRef = useRef<{ w: string; h: string } | null>(null);
  const isResizingRef = useRef(false);

  const slidesData = config.slidesData;


  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setCurrent(0);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isVisible]);

  // keyboard handling (existing)
  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(slidesData.length - 1, c + 1));
      if (e.key === 'Escape') (onClose || (() => { }))();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVisible, onClose]);

  // --- Resize handlers (mouse)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      // compute new width/height based on mouse position and modal position
      const modalEl = document.querySelector('.modal') as HTMLElement | null;
      if (!modalEl) return;
      const rect = modalEl.getBoundingClientRect();
      // new width/height ensuring min/max
      const minW = 320;
      const minH = 200;
      const maxW = window.innerWidth - 40;
      const maxH = window.innerHeight - 40;
      const newW = Math.max(minW, Math.min(maxW, Math.round(e.clientX - rect.left)));
      const newH = Math.max(minH, Math.min(maxH, Math.round(e.clientY - rect.top)));
      setModalWidth(newW + 'px');
      setModalHeight(newH + 'px');
      // when manually resizing we are not maximized
      if (isMaximized) setIsMaximized(false);
    };

    const onMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isMaximized]);

  const onResizerMouseDown = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  // maximize / restore
  const toggleMaximize = () => {
    if (!isMaximized) {
      // store previous
      prevSizeRef.current = { w: modalWidth, h: modalHeight };
      setModalWidth('96vw');
      setModalHeight('86vh');
      setIsMaximized(true);
    } else {
      // restore
      const prev = prevSizeRef.current;
      setModalWidth(prev?.w || defaultWidth);
      setModalHeight(prev?.h || defaultHeight);
      setIsMaximized(false);
    }
  };

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
        {/* pass dynamic style for width/height */}
        <div
          className="modal"
          onClick={e => e.stopPropagation()}
          style={{
            width: modalWidth,
            height: modalHeight,
            maxWidth: '96vw',
            maxHeight: '96vh'
          }}
        >
          <div className="modal-header">
            <button className="close-btn" onClick={closeHandler} aria-label={formatMessage('close')}>×</button>

            {/* resize / maximize button */}
            <button
              className="resize-btn"
              onClick={toggleMaximize}
              aria-label={isMaximized ? 'Restore' : 'Maximize'}
              title={isMaximized ? 'שחזור גודל' : 'הגדל לחלון מלא'}
            >
              {isMaximized ? '🗗' : '⬚'}
            </button>

            <h2>{formatMessage('whatsNewTitle')}</h2>
          </div>

          <div className="gallery-container">
            {slidesData.map((slide: any, idx: number) => (
              <div className={`slide${current === idx ? ' active' : ''}`} key={idx}>
                <h3>{slide.title}</h3>
                <p>{slide.desc}</p>
                <img src={slide.img} alt={slide.title} />
              </div>
            ))}

            <div className="navigation">
              <button className="nav-btn" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} aria-label="prev">←</button>

              <div className="dots" role="tablist" aria-label="slides">
                {slidesData.map((_: any, idx: number) => (
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
            <button className="dont-show-btn" onClick={dontShowHandler}>{formatMessage('dontShowAgain')}</button>
            <div className="slide-counter">
              <span>{current + 1}</span> / <span>{slidesData.length}</span>
            </div>
          </div>

          {/* resizer handle בפינה הימנית תחתונה */}
          <div className="resizer" onMouseDown={onResizerMouseDown} aria-hidden="true" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsNewGallery;