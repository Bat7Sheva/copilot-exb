/** @jsx jsx */
import { classNames, css, jsx } from "jimu-core";
import { Button } from "jimu-ui";


export const MainButton = ({ onClick, onEnter: onEnter, onLeave: onLeave, label, title, backgroundImage, className }:
    { onClick?: () => void, onEnter?: () => void, onLeave?: () => void, label?: string, title?: string, backgroundImage?: any, className?: string }) => {


    const style = css`
        .btn {
            background-image: url(${backgroundImage});
            background-size: cover;
            width: 5em;
            height: 5em;
            border-radius: 8px;

            color: var(--secondary-100);
            white-space: nowrap;
            padding-top: 60%;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); 
        }
        .btn:hover {
            color: var(--secondary-100);
            font-weight: bold;
        }
        .btn:active {
            filter: brightness(85%);
            border-color: var(--primary-700);
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }
    `;


    return (
        <div css={style}>
            <Button className={classNames('btn', className)} type='default' size='default' onClick={onClick} onMouseEnter={onEnter} title={title} aria-label={label}>{label}</Button>
        </div >
    )
};