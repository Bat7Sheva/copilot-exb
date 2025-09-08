import { css, IMThemeVariables } from 'jimu-core';


export const buttonStyles = (props) => {
    const theme: IMThemeVariables = props.theme;
    return css`
    
    &:hover {
        color: ${theme?.colors?.black};
    }    
    &:disabled {
        color: rgb(139, 139, 139) !important;
        background-color: rgb(227, 227, 227) !important;
        border-color: rgb(197, 197, 197) !important;
        text-decoration: none !important;
        font-style: normal !important;
    }   
    
    /* toolbar-icons */
    &.jimu-btn.avatar-button.icon-btn.btn.btn-primary.btn-lg>span.icon-btn-sizer>svg.jimu-icon.svg-component{
        color: white !important;
    }
    
    `;
};