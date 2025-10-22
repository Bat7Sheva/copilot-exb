/** @jsx jsx */
import { jsx, css, React } from 'jimu-core'
import { IMConfig } from '../../config'

interface Props {
  isVisible: boolean
  config: IMConfig
  onClose: () => void
  onDontShow: () => void
  formatMessage: (id: string, values?: { [key: string]: any }) => string
}

const WhatsNewGallery = ({ isVisible, config, onClose, onDontShow, formatMessage }: Props) => {
  if (!isVisible) return null

  const imageUrl = (config && (config.imageUrl || (config.images && config.images[0]))) || 'https://via.placeholder.com/800x380?text=Image'

  const overlayStyle = css`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.45);
    z-index: 9999;
    direction: rtl;
  `

  const cardStyle = css`
    width: 720px;
    max-width: calc(100% - 40px);
    background: #3f5960; /* כהה-טורקיז */
    border-radius: 12px;
    color: #fff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    overflow: hidden;
    font-family: Arial, Helvetica, sans-serif;
  `

  const imageWrap = css`
    width: 100%;
    height: 200px;
    background: #eee;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  `

  const content = css`
    padding: 22px 26px;
    text-align: center;
  `

  const title = css`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
  `

  const desc = css`
    font-size: 14px;
    color: rgba(255,255,255,0.9);
    line-height: 1.45;
    margin-bottom: 18px;
  `

  const footer = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid rgba(255,255,255,0.04);
    background: rgba(0,0,0,0.03);
  `

  const dots = css`
    display:flex;
    gap:8px;
    align-items:center;
    justify-content:center;
    flex:1;
    .dot {
      width:8px;
      height:8px;
      border-radius:50%;
      background: rgba(255,255,255,0.45);
    }
    .dot.active { background: #fff; width:10px; height:10px }
  `

  const arrows = css`
    display:flex;
    gap:8px;
    align-items:center;
    color:#fff;
    opacity:0.95;
    button {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.08);
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
    }
  `

  const linkStyle = css`
    color: rgba(255,255,255,0.85);
    font-size: 13px;
    text-decoration: underline;
    cursor: pointer;
    margin-right: 12px;
  `

  return (
    <div css={overlayStyle} role="dialog" aria-modal="true">
      <div css={cardStyle}>
        <div css={imageWrap}>
          <img src={imageUrl} alt={formatMessage?.('galleryImageAlt') || 'whats-new'} />
        </div>
        <div css={content}>
          <div css={title}>{formatMessage?.('newUITitle') || 'ממשק משתמש חדש'}</div>
          <div css={desc}>
            {formatMessage?.('newUIDescription') || 'עיצוב מודרני ונקי שמקל על הניווט והשימוש באפליקציה. חוויית משתמש משופרת עם אינטראקציות חלקות.'}
          </div>
        </div>
        <div css={footer}>
          <div css={arrows}>
            <button aria-label="prev" onClick={() => { /* ניתן ליישם ניווט שקופיות */ }}>←</button>
            <button aria-label="next" onClick={() => { /* ניתן ליישם ניווט שקופיות */ }}>→</button>
          </div>
          <div css={dots} aria-hidden>
            <div className="dot" />
            <div className="dot active" />
            <div className="dot" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <span css={linkStyle} onClick={onDontShow}>אל תציג לי הודעה זאת שוב</span>
            <button onClick={onClose} style={{marginLeft:12, background:'transparent', border:'none', color:'#fff', cursor:'pointer'}}>✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsNewGallery