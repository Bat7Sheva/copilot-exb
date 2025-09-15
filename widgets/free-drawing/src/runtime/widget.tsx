/** @jsx jsx */
import { React, jsx, type AllWidgetProps, useIntl } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig, DrawingTool } from '../config'
import { JimuDraw, type JimuDrawCreationMode } from 'jimu-ui/advanced/map'
import { getStyles } from './style'
import { versionManager } from '../version-manager'

import defaultMessages from './translations/default'
import DrawIcon from '../../icon.svg'
import { useEffect } from 'react'

const DRAWING_WIDGET_STATE_KEY = 'drawingWidgetState';

function Widget(props: AllWidgetProps<IMConfig>): React.ReactElement {
  const [currentJimuMapView, setCurrentJimuMapView] = React.useState(null)
  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    setCurrentJimuMapView(jimuMapView)
  }
  const drawContainerRef = React.useRef<HTMLDivElement>(null);
  const [drawingState, setDrawingState] = React.useState<any>(null);

  useEffect(() => {
    if (!currentJimuMapView || !drawContainerRef.current) return;

    const interval = setInterval(() => {
      const calciteAction = drawContainerRef.current!.querySelector('calcite-action[title="שרטט נקודה"]') ??
        drawContainerRef.current!.querySelector('calcite-action[title="Draw a point"]');
      const button = calciteAction?.shadowRoot?.querySelector('button');
      if (button) {
        button.click();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [currentJimuMapView]);

  // Restore drawing state on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(DRAWING_WIDGET_STATE_KEY);
    if (saved) setDrawingState(JSON.parse(saved));
  }, []);

  // Save drawing state on change
  React.useEffect(() => {
    if (drawingState) {
      localStorage.setItem(DRAWING_WIDGET_STATE_KEY, JSON.stringify(drawingState));
    }
  }, [drawingState]);

    // useEffect(() => {
    //   if (props.state === WidgetState.Closed) {
    //     // console.log('הוידג׳ט נסגר');
  
    //     setSearchValue('');
    //     setShowCameraDetails(false);
    //     setSelectedObj({});
    //     resetView();
  
    //     if (layerData?.targetLayer) {
    //       setLayerVisibility(layerData.targetLayer, false);
    //     }
  
    //     // Save drawing widget state
    //     localStorage.setItem(DRAWING_WIDGET_STATE_KEY, JSON.stringify(drawingWidgetState));
  
    //     props.dispatch(appActions.closeWidget(props.id));
  
    //   }
    // }, [props.state]);

  // visibleElements
  const visibleElements = {} as __esri.SketchVisibleElements
  visibleElements.createTools = {
    point: props.config.drawingTools.includes(DrawingTool.Point),
    polyline: props.config.drawingTools.includes(DrawingTool.Polyline),
    polygon: props.config.drawingTools.includes(DrawingTool.Polygon),
    rectangle: props.config.drawingTools.includes(DrawingTool.Rectangle),
    circle: props.config.drawingTools.includes(DrawingTool.Circle)
  }

  // hide API setting icon for 10.1
  visibleElements.settingsMenu = false

  const isShowPlaceHolderFlag = (!currentJimuMapView)
  const placeHolderTips = useIntl().formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })
  // Renderer
  return <div className='draw-widget-container h-100' css={getStyles()}>
    { /* 1.placeholder */ }
    {isShowPlaceHolderFlag &&
      <div className='w-100 h-100'>
        <WidgetPlaceholder className='w-100 placeholder-wapper'
          icon={DrawIcon} widgetId={props.id} message={placeHolderTips}
        />
      </div>
    }
    { /* 2.jimu-draw */ }
    {!isShowPlaceHolderFlag &&
      <div ref={drawContainerRef}>
        <JimuDraw
          jimuMapView={currentJimuMapView}
          isDisplayCanvasLayer={props.config.isDisplayCanvasLayer}
          // api options
          drawingOptions={{
            creationMode: props.config.drawMode as unknown as JimuDrawCreationMode,
            visibleElements: visibleElements,
            // snapping
            //snappingOptions?: __esri.SnappingOptionsProperties
            // defaults
            updateOnGraphicClick: true,
            // drawingEffect3D
            drawingElevationMode3D: props.config.drawingElevationMode3D
          }}
          // ui
          uiOptions={{
            arrangement: props.config.arrangement,
            isAutoWidth: props.autoWidth,
            isAutoHeight: props.autoHeight
          }}
          // measurements
          // eslint-disable-next-line
          measurementsInfo={props.config.measurementsInfo.asMutable() as any}
          measurementsUnitsInfos={props.config.measurementsUnitsInfos.asMutable()}
        // other options
        // העברת סטייט ואירוע שינוי ל-JimuDraw
        drawingState={drawingState}
        onDrawingStateChange={handleDrawChange}
        ></JimuDraw>
      </div>
    }
    { /* 3.map view comp */ }
    <JimuMapViewComponent
      useMapWidgetId={props.useMapWidgetIds?.[0]}
      onActiveViewChange={handleActiveViewChange}
    />
  </div>
}

Widget.versionManager = versionManager
export default Widget
