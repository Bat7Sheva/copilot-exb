/** @jsx jsx */
import { css, jsx, React, type AllWidgetProps, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { type IMConfig } from '../config'
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui';
import defaultMessages from './translations/default';
import { useEffect, useState } from 'react';

const Widget = (props: AllWidgetProps<IMConfig>) => {


  const { config, intl, theme } = props;
  const [visible, setVisible] = useState(true);

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
    .cookies-box {
      width: 100%; 
      height: 55px ; 
      overflow: auto;  
      background-color: rgb(0,0,0); 
      background-color: rgba(0,0,0,0.8);  
      -webkit-animation-name: slideIn;
      -webkit-animation-duration: 2s;
      display:block;
      position: absolute !important; 
      inset: auto auto 0px ;  
      animation-name: slideIn;
      animation-duration: 2s;
      z-index:2;
    }

    .message-content{
      color:#fefefe;
      clear: both;
      display: block;
      font-size: 1em;
      word-wrap: break-word;
    }

    .cookies-content{
    	padding:8.5px 0;
    	display:flex;
    	flex-direction:column;
    	align-items:center;
    }

    .close-span {
      float: right;
      font-size:30px;
      font-weight: bold;
      padding: 0 15px;
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
    </div>
  )
}

export default Widget
