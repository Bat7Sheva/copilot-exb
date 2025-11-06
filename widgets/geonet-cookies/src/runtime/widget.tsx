/** @jsx jsx */
import { css, jsx, React, type AllWidgetProps, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { type IMConfig } from '../config'
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui';
import defaultMessages from './translations/default';
import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config, intl } = props;
  const [visible, setVisible] = useState(true);
  const [isAnchorReady, setIsAnchorReady] = useState(false);
  const [portalDiv, setPortalDiv] = useState<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof Storage !== 'undefined') {
      if (localStorage.acceptCookie !== undefined) {
        setVisible(false);
      }
    }
  }, []);

  useEffect(() => {
    if (anchorRef.current && !isAnchorReady) {
      setIsAnchorReady(true);
    }
  }, [anchorRef.current, isAnchorReady]);

  useEffect(() => {
    // יצירת div ייעודי לפורטל ב-document.body
    let div = document.getElementById('cookies-portal-root');
    if (!div) {
      div = document.createElement('div');
      div.id = 'cookies-portal-root';
      document.body.appendChild(div);
    }
    setPortalDiv(div);

    // ניקוי div כשקומפוננטה מוסרת
    return () => {
      if (div && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    };
  }, []);

  const closeWidget = () => {
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('acceptCookie', '1');
    }
    setVisible(false);
  };

  const formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuiDefaultMessage, jimuCoreMessages)
    return intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }

  const style = css`
    .cookie-anchor {
      width: 25px;
      height: 25px;
      position: relative;
      display: inline-block;
      background: #fffbe6;
      border: 2px solid #e0c200;
      border-radius: 50%;
      z-index: 10000;
    }
    .cookies-portal-box {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 400px;
      background-color: rgba(0,0,0,0.7);
      border-radius: 8px;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation-name: slideIn;
      animation-duration: 2s;
      box-shadow: 0 2px 16px rgba(0,0,0,0.3);
    }

    .message-content{
      color:#fefefe;
      clear: both;
      display: flex;
      align-items: center;
      font-size: 1em;
      word-wrap: break-word;
    }

    .cookies-content{
    	display:flex;
    	flex-direction:column;
    	align-items:center;
      
      p {
        margin: 14px 0;
      }
    }

    .close-span {
      font-size:30px;
      font-weight: bold;
      padding: 0 15px;
      position: absolute;
      left: 0;
    }

    .close-span:hover,
    .close-span:focus {
      text-decoration: none;
      cursor: pointer;
    } 

    @-webkit-keyframes slideIn {
      from {  opacity: 0 } 
      to {  opacity: 1  }
    }

    @keyframes slideIn {
      from {  opacity: 0 }
      to {  opacity: 1 }
    }
 `;


  if (!visible) return null;

  let portalContent = (
    <div className="cookies-portal-box" css={style}>
      <div className="message-content">
        <span className="close-span" onClick={closeWidget} >&times;</span>
        <div className="cookies-content">
          <p> {formatMessage('message1')}
            <a href={config.linkForIroads} target="_blank" rel="noopener noreferrer">{formatMessage('message2')}</a>
            {formatMessage('message3')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="cookie-anchor" ref={anchorRef} tabIndex={-1} aria-label="Cookies Info"></div>
      {portalDiv && ReactDOM.createPortal(portalContent, portalDiv)}
    </div>
  )
}

export default Widget
