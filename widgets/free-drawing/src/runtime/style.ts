import { css, type SerializedStyles } from 'jimu-core'

export function getStyles(): SerializedStyles {

  return css`
    .placeholder-wapper { /* larger placeholder size ,#11524 */
      display: flex;
      align-items: center;
      min-width: 440px;
      min-height: 444px;
    }

    color: var(--light-100);

    .esri-sketch > .esri-sketch__panel {
      flex-direction: column;
    }

    .esri-sketch > .esri-sketch__panel .esri-sketch__tool-section {
      flex-direction: column;
    }

    .esri-selection-toolbar__container {
      flex-direction: column;
    }

    .esri-selection-toolbar__container {
        calcite-action {
            div.interaction-container{
                button.button{
                    background-color: var(--primary-600) !important; 
                    border-radius: 10px !important;
                    --calcite-color-text-3: #181818 !important;
                    --calcite-color-text-3: red !important;
                    --calcite-color-foreground-3: blue !important;
                    --calcite-color-text-2: green !important;
                    --calcite-color-foreground-3: yellow !important;
                }
            }
        }
    }

    .jimu-draw-layouts-container .panel-layout-container {
      flex-direction: row !important;
    }

    .select-draw-mode-tips{
      display: none !important;
    }

    .panel.surface-1.border-0.jimu-draw-layouts-container.h-100 {
      background-color: var(--primary-600) !important;
    }

    .symbol-list-wapper.p-1.mb-4 {
        border-radius: 5px;
    }

  .jimu-draw-sketch-tools.d-flex.surface-1.border-0 {
    border-radius: 10px;
  }
  
  div.show-handlers {
    input.jimu-numeric-input-input {
    border-radius: 5px !important;
    }
  }

  .d-flex.align-items-center.justify-content-center.style-setting--unit-selector {
    border-radius: 0 5px 5px 0;
  }
  
  input.jimu-numeric-input-input {
      border-radius: 5px 0 0 5px;
  }

  .color-picker-block {
    border-radius: 5px;
  }

  div.jimu-drawtool {
    div.w-100.d-flex  {
      margin-top: 55px;
    }
  }

  input.jimu-slider.slider.mr-2 {
    border-radius: 10px;
    background-color: rgb(227, 227, 227);
    padding: 0 10px;
  }

  div.preview-item>.app-root-emotion-cache-rtl-w9pehv.symbol-item {
    background-color: rgb(197, 197, 197);
  }

  // calcite-icon[icon="circle"] {
  //   display: none !important;
  // }

  // calcite-action[title="שרטט עיגול"],
  // calcite-action[title="Draw a circle"] {
  //   background-repeat: no-repeat;
  //   background-position: center;
  //   background-size: 16px 16px;
  //   fill: var(--calcite-color-text-1);
  //   color: var(--calcite-color-text-1);
  // }
  `
}
