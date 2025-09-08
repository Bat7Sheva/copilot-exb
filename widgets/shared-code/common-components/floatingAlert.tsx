/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { ReactElement } from 'react';
import { Alert } from 'jimu-ui';

type FloatingAlertProps = {
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    visible?: boolean;
    onClose?: () => void;
    fontSize: string;
    top: string;
    left: string;

};

export default function FloatingAlert({
    message,
    type = 'info',
    visible = true,
    onClose,
    fontSize = '15px',
    top = '35px',
    left = '50%',


}: FloatingAlertProps): ReactElement | null {
    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                zIndex: 10000,
            }}
        >

            <Alert
                className="custom-alert"
                form="basic"
                type={type}
                text={message}
                withIcon={true}
                closable={true}
                onClose={onClose}
                style={{
                    maxWidth: '300px',
                    fontSize: fontSize,
                    position: "fixed",
                    width: "max-content",
                    textAlign: "center",
                    top: top,
                    left: left,
                    transform: "translate(-50%)"
                }}

            />

            <style>
                {`
                   .custom-alert {
                        background-color: rgba(250, 250, 250, 0.7) !important;          
                        border-radius: 8px !important;
                        padding: 8px !important;
            
                   }
                   .text-left {
                       text-align: center !important;
                       color: black !important;
                   }
               `}
            </style>
        </div>
    );
}