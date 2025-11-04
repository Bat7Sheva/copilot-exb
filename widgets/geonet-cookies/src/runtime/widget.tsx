/** @jsx jsx */
import { css, jsx, React, type AllWidgetProps, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { type IMConfig } from '../config'
import { defaultMessages as jimuiDefaultMessage, Popper } from 'jimu-ui';
import defaultMessages from './translations/default';
import { useEffect, useState, useRef } from 'react';


const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config, intl } = props;
  const [visible, setVisible] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof Storage !== 'undefined') {
      if (localStorage.acceptCookie !== undefined) {
        setVisible(false);
      }
    }
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
    }
    .cookies-box {
      width: 100%; 
      overflow: auto;  
      background-color: rgba(0,0,0,0.7);  
      -webkit-animation-name: slideIn;
      -webkit-animation-duration: 2s;
      inset: auto auto 0px ;  
      animation-name: slideIn;
      animation-duration: 2s;
      z-index:2;
      border-radius: 8px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
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

  return (
    <div css={style}>
      <div className="cookie-anchor" ref={anchorRef} tabIndex={-1} aria-label="Cookies Info"></div>
      <Popper
        style={{width: 'calc(98% - 300px)', borderRadius: '8px', backgroundColor: "transparent", boxShadow: "none", border: "none"  }}
        open={true}
        placement="right"
        reference={anchorRef.current}
        showArrow={false}
        offset={[0, 12]}
        trapFocus={false}
        autoFocus={false}
        css={style}
      >
          <div className="cookies-box">
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

       </Popper>
     </div>
  )
}

export default Widget
