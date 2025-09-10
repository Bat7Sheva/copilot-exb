/** @jsx jsx */
import { React, css, jsx, type AllWidgetProps, classNames, getAppStore, ContainerType } from 'jimu-core'
import { type IMConfig } from '../config'
import { JimuMapView, JimuMapViewComponent, MapViewManager } from 'jimu-arcgis'
import { useEffect, useState } from 'react'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import { MainButton } from "../../../shared-code/common-components/main-button";
import { getAllLayers, getLayerByLayerUrl, setLayerVisibility } from 'widgets/shared-code/utils'



const Widget = (props: AllWidgetProps<IMConfig>) => {

  const [currentJimuMapView, setCurrentJimuMapView] = React.useState<JimuMapView>(null);
  const [mapWidgetId, setMapWidgetId] = useState<string>();
  const [wazeBtnClicked, setWazeBtnClicked] = useState<boolean>(false);
  const wazeImage = require("./assets/images/waze.svg");



  useEffect(() => {
    const state = getAppStore().getState();
    const { appConfig, browserSizeMode, appRuntimeInfo } = state;
    const { currentPageId, currentDialogId } = appRuntimeInfo;
    const isDialog = !!currentDialogId;
    const containerType = isDialog ? ContainerType.Dialog : ContainerType.Page;
    const containerId = isDialog ? currentDialogId : currentPageId;
    const mapWidgetGroups = searchUtils.getMapWidgets(appConfig, browserSizeMode, containerType, containerId);
    const currentContainerMap = mapWidgetGroups.find(group => group.id === containerId)?.maps;

    if (currentContainerMap?.length > 0) {
      setMapWidgetId(currentContainerMap[0]);
    }
  }, [])


  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    setCurrentJimuMapView(jimuMapView);
  }

  const handleWazeClick = () => {
    if (!currentJimuMapView || !currentJimuMapView?.view?.extent) return;

    const allLayers = getAllLayers(currentJimuMapView.view as __esri.MapView);
    if (!allLayers || allLayers.length === 0) {
      console.warn("No layers in the map.");
      return;
    }

    props.config.wazeLayers.forEach((wazeLayer) => {
      const targetLayer = getLayerByLayerUrl(allLayers, wazeLayer.url);
      if (targetLayer) {
        setLayerVisibility(targetLayer, !wazeBtnClicked);
      }
    });
    setWazeBtnClicked(!wazeBtnClicked);
  }


  const style = css`
    .waze-btn {
      background: linear-gradient(0deg, #34394F, #34394F),
        linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
      box-shadow: 0px 4px 40px 0px #0000004D;
      background-repeat: no-repeat;
      background-position: center 75%;
      background-size: 40% !important;
      font-family: 'Almoni DL AAA', sans-serif;
      font-weight: 700;
      font-style: bold;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0%;
      text-align: center;
      color: #FFFFFF;
    }
    .waze-btn:hover, .waze-btn:active, .selected {
      background: linear-gradient(0deg, #34394F, #34394F),
        linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
      font-weight: bold;
      border-width: revert;
      border-color: black;
    }

    typography {
    font-family: Almoni DL AAA;
    font-weight: 700;
    font-style: Bold;
    font-size: 12px;
    leading-trim: NONE;
    line-height: 16px;
    letter-spacing: 0%;
    text-align: center;
    background: #FFFFFF;
    }

  frame {
  // colors
  background: linear-gradient(0deg, #34394F, #34394F),
  linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));

  // shadws and blurs
  box-shadow: 0px 4px 40px 0px #0000004D;

}
  `;

  return (
    <div css={style}>

      <MainButton
        onClick={handleWazeClick}
        label={'Waze'}
        backgroundImage={wazeImage}
        className={classNames({ 'selected': wazeBtnClicked },'waze-btn') }
        // className='waze-btn'
      />

      {mapWidgetId &&
        <JimuMapViewComponent
          useMapWidgetId={mapWidgetId}
          onActiveViewChange={handleActiveViewChange} />
      }
    </div>
  )
}

export default Widget
