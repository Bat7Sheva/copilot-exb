import { Button } from 'jimu-ui';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface WhatsNewsPopupProps {
    isVisible: boolean;
    position?: 'top' | 'center' | 'bottom';
    isModal?: boolean;
    showCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    autoCloseAfter?: number;
    onCloseTemporary?: () => void;
    onCloseForever?: () => void;
    setVisibleWhatsNewGallery?: () => void;
    formatMessage: (key: string) => string;
    //   formatMessage: (id: string, values?: { [key: string]: any }) => string;

}


const WhatsNewsPopup: React.FC<WhatsNewsPopupProps> = ({
    isVisible,
    position = 'center',
    isModal = true,
    showCloseButton = true,
    closeOnOutsideClick = true,
    autoCloseAfter,
    onCloseTemporary,
    onCloseForever,
    setVisibleWhatsNewGallery,
    formatMessage
}) => {
    if (!isVisible) return null;

    const newsImage = require("../assets/images/news.png");

    useEffect(() => {
        if (!autoCloseAfter || !onCloseTemporary) return;

        const timeoutId = setTimeout(() => {
            onCloseTemporary();
        }, autoCloseAfter);

        return () => clearTimeout(timeoutId);
    }, [autoCloseAfter, onCloseTemporary]);

    const handleBackgroundClick = () => {
        if (closeOnOutsideClick && onCloseTemporary) {
            onCloseTemporary();
        }
    };


    const getPositionStyle = () => {

        switch (position) {
            case 'top':
                return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
            case 'bottom':
                return { bottom: '30px', left: '50%', transform: 'translateX(-50%)' };
            case 'center':
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }

    };

    return ReactDOM.createPortal(
        <>
            {/* רקע מודאלי (אם נדרש) */}
            {isModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        zIndex: 999,
                    }}
                    onClick={handleBackgroundClick}
                />
            )}

            {/* תיבת ההודעה */}
            <div
                style={{
                    position: 'fixed',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    padding: '24px 36px',
                    borderRadius: '12px',
                    minWidth: '320px',
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    color: 'white',
                    // backgroundColor: 'rgba(54, 54, 54, 0.7)',
                    backgroundColor: '#00000099',
                    // backdropFilter: 'blur(10px)',
                    ...getPositionStyle()
                }}
                onClick={(e) => e.stopPropagation()} // מונע סגירה בלחיצה פנימית
            >
                {/* כפתור סגירה */}
                {showCloseButton &&
                    < div
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 16,
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: 'white',
                        }}
                        onClick={onCloseTemporary}
                    >
                        ✕
                    </div>
                }

                <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                    <img src={newsImage} alt='newsImage'></img>
                </div>

                <div style={{ fontSize: '18px', opacity: 0.8, whiteSpace: "pre-line", 'color': '#91F9F4' }}>
                    {formatMessage('whatsNewsPopupTitle')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                        style={{ backgroundColor: '#91F9F426', color: '#91F9F4', borderRadius: '5px', border: 'none', margin: '10px 0' }}
                        onClick={() => { setVisibleWhatsNewGallery(); }}
                    >
                        {formatMessage('forMoreInfo')}
                    </Button>

                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={onCloseForever}>
                        {formatMessage('dontShowAgain')}
                    </span>
                </div>

            </div >
        </>,
        document.body
    );
};

export default WhatsNewsPopup;