import { css, IMThemeVariables } from 'jimu-core';


export const globalStyles = (props) => {
  const theme: IMThemeVariables = props.theme;

  return css`

    :root{
    }

    
    /* map-tools region */
    .exbmap-ui.exbmap-ui-tool-shell.divitem.exbmap-ui-tool-shell-ExtentNavigate,
    .exbmap-ui.exbmap-ui-tool-shell.divitem.exbmap-ui-tool-shell-Home,
    .exbmap-ui.exbmap-ui-tool-shell.divitem.exbmap-ui-tool-shell-Locate,
    .exbmap-ui.exbmap-ui-tool-shell.divitem.exbmap-ui-tool-shell-Zoom {
      box-shadow: none;
    }

    .exbmap-ui.exbmap-ui-tool-panel,
    .zoom-map-tool.esri-zoom.esri-widget {
      background-color: transparent;
      
      
      .esri-widget--button:is(calcite-button) {
        --calcite-ui-icon-color: ${theme?.colors?.white};
        }
        
        /* עיצוב כללי של כפתורי הזום */
        .esri-widget--button.extent-navigate-btn,
        calcite-button.esri-widget--button {
          background-color:  rgb(54, 54, 54, 0.75);
          color: ${theme?.colors?.white};
          transition: background-color 0.3s ease; /* מעבר חלק */


          &:hover,
          &:active,
          &:focus {
          --calcite-color-foreground-2: rgb(54, 54, 54, 0.75);
          --calcite-color-foreground-1:  rgb(54, 54, 54, 0.75);
          --calcite-color-brand:  rgb(54, 54, 54, 0.75);
          background-color: rgb(54, 54, 54);

        }
      }

      /* טיפול במבנה של כפתורי הזום */
      calcite-button.esri-widget--button:first-child {
        border-radius: 50px 50px 0 0;
      }
      calcite-button.esri-widget--button:last-child {
        border-radius: 0 0 50px 50px;
      }
      .esri-widget--button.extent-navigate-btn:first-child {
        border-radius: 50px 50px 0 0;
      }
      .esri-widget--button.extent-navigate-btn:last-child {
        border-radius: 0 0 50px 50px;
      }
      .esri-widget--button.locate-map-tool.esri-locate.esri-widget,
      .esri-home.esri-widget,
      .compass-map-tool.esri-compass.esri-widget{
        background-color: transparent;
        border:none;
          calcite-button.esri-widget--button{
            // border-radius: 50px;
			      -webkit-border-radius: 50%;
          }
      }
    }
   
    .zoom-widget {
    
     button.btn.btn-default.esri-widget--button.icon-btn.jimu-btn.place-holder {
			color: ${theme.colors.white};
			background-color: rgba(54, 54, 54, 0.75);
			-webkit-border-radius: 50%;
			-webkit-box-shadow: 0 1px 0.5px rgba(0,0,0,0.3), 0 2px 2px rgba(0,0,0,0.2);
			box-shadow: rgb(0 0 0 / 20%) 0px 1px 2px 0px;
    }
     
			.place-holder{
				&:hover,
				&:active,
				&:focus {
					color: ${theme.colors.white};
					background-color: rgba(54, 54, 54);
		  	}
		  }
    }


    /* map-tools region end */


    .jwplayer {
      border-radius: 15px;
    }

  .exbmap-ui.exbmap-ui-group.exbmap-ui-group-leftTopContainer
  {
    top: 63px !important;
  }

  /* temp region */

    .panel-container {
      .controller-panel.flex-column.w-100.h-100 {
        // title
        .panel-header.d-flex.align-items-center.flex-shrink-0.px-4{
          background-color: var(--primary-900);
        }
        //body
        .panel-content.d-flex.flex-grow-1 {
          // background-color: ${theme.colors.palette.primary[600]};
          background-color: var(--primary-600);
        }
        .align-items-center.border-0.d-flex.jimu-widget.justify-content-center.surface-1.widget-add-data {
          background-color: var(--primary-600) !important;
        }
      }
    }
    .app-root-emotion-cache-rtl-1rzlx07.avatar-card:not(.add-widget-btn)>.avatar>.avatar-button {
      background-color: transparent;
      border-color: transparent;
      }
    /* temp region end */ 

    /* Add Data region */
    
    .app-root-emotion-cache-rtl-h28ys6 .no-data-placeholder {
      left: 80% !important;
      top: 5% !important;
    }

    div.popper.app-root-emotion-cache-rtl-1l224np[aria-label="הוסף נתונים"] {
      left: -376px !important;
      top: 20%  !important;
      border: none;
      box-shadow: none !important;
    

      div.popper-box {
      background-color: var(--primary-600) !important;
      color: var(--secondary-100) !important;
     }
    }

    .jimu-nav-link-wrapper>.tab-title {
      color: var(--secondary-100) !important;
    }


    .jimu-input-area.jimu-url-input.w-100 {
      textarea.w-100.form-control {
        background-color: var(--primary) !important;
        color: white !important;
        border: 1px solid var(--secondary-900) !important;
        
      }
    }

    .warn-icon.d-flex.align-items-center.mt-2 {

      svg.jimu-icon.jimu-icon-component.svg-component, .app-root-emotion-cache-rtl-a0bykv {
        --danger-700: #F44336;
      }
    }

    // .popper.inner-popper.jimu-dropdown-menu.dropdown-menu.show {
    //   background-color: var(--primary-600) !important;
    //   border: solid var(--primary-600) !important;

    //     .jimu-dropdown-item{
    //       color:white !important;
    //     }
    // }

     ul.jimu-nav.tab-nav.app-root-emotion-cache-rtl-238czl.text-center.nav-underline.nav.nav-fill >
    .text-truncate.nav-item > a {
      
      background-color: var(--primary-700);
      border-radius: 8px !important;
      
      &[aria-selected="true"] {
      background-color: var(--primary-100);
      
      span.jimu-nav-link-wrapper>
      span.tab-title {
        color: var(--dark-900) !important;
      }
    }


  /* Add Data region end */

`
};
