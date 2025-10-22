/** @jsx jsx */
import { css, jsx, React, type AllWidgetProps, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { type IMConfig } from '../config'
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui';
import defaultMessages from './translations/default';
import { useEffect, useState } from 'react';
import WhatsNewsPopup from './components/whats-news-popup';
import WhatsNewGallery from './components/WhatsNewGallery';

const Widget = (props: AllWidgetProps<IMConfig>) => {


  const { config, intl, theme } = props;
  const [visible, setVisible] = useState(true);
  const [visibleWhatsNewGallery, setVisibleWhatsNewGallery] = useState(false);
  const [allowedByDate, setAllowedByDate] = useState<boolean>(false);

  useEffect(() => {
    if (!config.startDate) {
      setAllowedByDate(true);
      return;
    }
    const start = new Date(config.startDate);
    if (isNaN(start.getTime())) {
      setAllowedByDate(true);
      return;
    }
    const now = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + config.durationDays);
    setAllowedByDate(now >= start && now <= end);
  }, []);

  useEffect(() => {
    if (typeof Storage !== 'undefined') {
      if (localStorage.whatsNews !== undefined || !allowedByDate) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    }
  }, [allowedByDate]);

  const handleWhatsNewsClick = () => {
    setVisible(true);
  }

  const onCloseTemporary = () => {
    setVisible(false);
  }

  const onCloseForever = () => {
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('whatsNews', '1');
    }
    setVisible(false);
  }

  const openWhatsNewGallery = () => {
    setVisible(false);
    setVisibleWhatsNewGallery(true);
  }

  const formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuiDefaultMessage, jimuCoreMessages)
    return intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }

  const style = css`
    .open-btn {
      background: #f44356;
      color: #fff;
      border: none;
      border-radius: 20px 0 0 20px;
      padding: 6px 10px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(244,67,86,0.12);
      transition: background 0.2s, box-shadow 0.2s;
      display: inline-block;
      outline: none;
      margin: 12px;
      margin-top: 2px;
      letter-spacing: 0.5px;
      position: relative;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-radius: 10px 2px 2px 10px;
    }
    .open-btn::after {
      content: '';
      position: absolute;
      right: -18px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 16px solid transparent;
      border-bottom: 16px solid transparent;
      border-left: 18px solid #f44356;
    }
    .open-btn:hover, .open-btn:focus {
      background: #d32f2f;
      box-shadow: 0 4px 16px rgba(244,67,86,0.18);
    }
    .open-btn:hover::after, .open-btn:focus::after {
      border-left-color: #d32f2f;
    }
 `;


  return (
    <div css={style}>
      <button className="open-btn" onClick={handleWhatsNewsClick}>מה חדש</button>

      {visible &&
        <WhatsNewsPopup
          isVisible={visible}
          position='center'
          isModal={false}
          showCloseButton={true}
          closeOnOutsideClick={false}
          onCloseTemporary={onCloseTemporary}
          onCloseForever={onCloseForever}
          setVisibleWhatsNewGallery={openWhatsNewGallery}
          formatMessage={formatMessage}
        />
      }

      {visibleWhatsNewGallery &&
        <WhatsNewGallery
          isVisible={visibleWhatsNewGallery}
          config={config}
          onClose={() => setVisibleWhatsNewGallery(false)}
          onDontShow={() => setVisibleWhatsNewGallery(false)}
          formatMessage={formatMessage} />
      }
    </div>
  )
}

export default Widget
