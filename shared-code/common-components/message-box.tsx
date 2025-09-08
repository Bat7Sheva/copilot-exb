import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface MessageBoxProps {
    isVisible: boolean;
    position?: 'top' | 'center' | 'bottom';
    type?: 'error' | 'info' | 'success' | 'warning';
    message?: string;
    subMessage?: string;
    isModal?: boolean;
    showCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    autoCloseAfter?: number;
    onClose?: () => void;
}

const iconMap: Record<string, string> = {
    error: '❌',
    info: '🔍',
    success: '✅',
    warning: '⚠️',
};

const MessageBox: React.FC<MessageBoxProps> = ({
    isVisible,
    position = 'center',
    type = 'info',
    message,
    subMessage,
    isModal = true,
    showCloseButton = true,
    closeOnOutsideClick = true,
    autoCloseAfter,
    onClose
}) => {
    if (!isVisible) return null;

    const handleBackgroundClick = () => {
        if (closeOnOutsideClick && onClose) {
            onClose();
        }
    };

    useEffect(() => {
        if (!autoCloseAfter || !onClose) return;

        const timeoutId = setTimeout(() => {
            onClose();
        }, autoCloseAfter);

        return () => clearTimeout(timeoutId);
    }, [autoCloseAfter, onClose]);

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
                    backgroundColor: 'rgba(54, 54, 54, 0.7)',
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
                        onClick={onClose}
                    >
                        ✕
                    </div>
                }

                {/* אייקון */}
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                    {iconMap[type]}
                </div>

                {/* טקסט */}
                {message &&
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>
                        {message}
                    </div>
                }

                {subMessage && (
                    <div style={{ fontSize: '18px', opacity: 0.8 }}>
                        {subMessage}
                    </div>
                )}
            </div >
        </>,
        document.body
    );
};

export default MessageBox;