/** @jsx jsx */
import { useEffect, useState } from 'react';
import { css, jsx, AllWidgetProps, defaultMessages as jimuCoreMessages, ContainerType, getAppStore, appActions } from 'jimu-core';
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui';
import { JimuMapView, JimuMapViewComponent, MapViewManager } from 'jimu-arcgis';
import defaultMessages from './translations/default';
import { type IMConfig } from '../config';
import { getAllLayers, getjimuLayerViewByLayer, getLayerByLayerUrl, queryService, setLayerVisibility } from 'widgets/shared-code/utils';
import { TraficCameraDetails } from './components/trafic-camera-details';
import { Autocomplete } from '../../../shared-code/common-components/autocomplete'
import { searchUtils } from 'jimu-layouts/layout-runtime';

import { ReactRedux, type IMState, WidgetState } from 'jimu-core'
const { useSelector } = ReactRedux

const Widget = (props: AllWidgetProps<IMConfig>) => {

  const { config, intl, theme } = props;
  const [currentJimuMapView, setCurrentJimuMapView] = useState<JimuMapView>();
  const cameraImage = require("./assets/images/CAM.png");  
  const [showCameraDetails, setShowCameraDetails] = useState(false);
  const [selectedObj, setSelectedObj] = useState<object>({});
  const [searchValue, setSearchValue] = useState<string>('');
  const [defaultViewPoint, setDefaultViewPoint] = useState<__esri.Extent>();
  const [layerData, setLayerData] = useState<{ allLayers: __esri.Layer[] | null; targetLayer: __esri.Layer | null }>({ allLayers: null, targetLayer: null });
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [mapWidgetId, setMapWidgetId] = useState<string>();


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
  }, []);


  useEffect(() => {
    if (props.state === WidgetState.Closed) {
      // console.log('הוידג׳ט נסגר');

      setSearchValue('');
      setShowCameraDetails(false);
      setSelectedObj({});
      resetView();

      if (layerData?.targetLayer) {
        setLayerVisibility(layerData.targetLayer, false);
      }

      props.dispatch(appActions.closeWidget(props.id));

    }
  }, [props.state]);

  useEffect(() => {
    if (!currentJimuMapView || !currentJimuMapView?.view?.extent || props.state === WidgetState.Closed) return;

    const allLayers = getAllLayers(currentJimuMapView.view as __esri.MapView);
    if (!allLayers || allLayers.length === 0) {
      console.warn("No layers in the map.");
      return;
    }

    const targetLayer = getLayerByLayerUrl(allLayers, props.config.cameraLayerUrl);
    if (targetLayer) {
      // if (targetLayer && widgetState !== WidgetState.Closed) {
      setLayerVisibility(targetLayer, true);
    }

    setLayerData({ allLayers, targetLayer });
    if (!defaultViewPoint) {
      setDefaultViewPoint(currentJimuMapView.view.extent.clone());
    }

    currentJimuMapView.clearSelectedFeatures();
    currentJimuMapView.view.popupEnabled = false;
    currentJimuMapView.view.on("click", handleClick)

    return () => {
      if (targetLayer) {
        setLayerVisibility(targetLayer, false);
      }
    };
  }, [currentJimuMapView, currentJimuMapView?.view?.extent]);

  const formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuiDefaultMessage, jimuCoreMessages)
    return intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }

  const objectIdQueryFunction = async (value: string): Promise<any[]> => {
    const query = props.config.objectIdQuery.replace('{0}', value.toString());
    return queryLayer(query);
  };

  const descriptionQueryFunction = async (value: string): Promise<any[]> => {
    const query = props.config.descriptionQuery.replace('{0}', value.toString());
    return queryLayer(query);
  };

  const queryLayer = async (query: string): Promise<any[]> => {
    const outFields = ['*'];

    const result = await queryService(props.config.cameraLayerUrl, query, outFields, true);
    return result?.features ?? [];
  };

  const searchCameraSelected = async (obj: any, setSerchInputVal: boolean = false, zoom: boolean = true) => {
    if (setSerchInputVal) setSearchValue(obj.attributes.Description);
    setShowCameraDetails(true);
    setSelectedObj(obj);
    if (!zoom) return;
    await currentJimuMapView.view.goTo({ target: [obj.geometry], zoom: 12 });


    const objectIds = [obj.attributes.OBJECTID];

    if (objectIds?.length <= 0) {
      console.error("There is no objectid field.");
      return;
    }

    const jLayerView = getjimuLayerViewByLayer(currentJimuMapView, layerData.targetLayer);

    if (!jLayerView) {
      console.error("Layer view not found.");
      return;
    }


    currentJimuMapView.clearSelectedFeatures();
    jLayerView.selectFeaturesByIds(objectIds);
  }

  const goBack = () => {
    setShowCameraDetails(false);
    setSearchValue('');
    resetView();
  }

  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    setCurrentJimuMapView(jimuMapView);
  }

  const resetView = () => {
    if (defaultViewPoint) {
      currentJimuMapView.view.goTo(defaultViewPoint);
      currentJimuMapView.clearSelectedFeatures();
    }
  }

  const handleClick = async (event) => {
    const response = await currentJimuMapView.view.hitTest(event);

    const cameraGraphic = response.results.find(result => {
      const g = (result as __esri.GraphicHit).graphic;
      return g && g.layer && g.layer.type === "feature" && props.config.cameraLayerUrl === (g.layer as __esri.FeatureLayer).url.concat("/", (g.layer as __esri.FeatureLayer).layerId.toString());
    });

    if (cameraGraphic) {
      const graphic = (cameraGraphic as __esri.GraphicHit).graphic;
      const attributes = graphic.attributes;

      const res = await objectIdQueryFunction(attributes.OBJECTID);
      if (res && res.length == 1) {
        setSelectedCamera(res[0]);
        await searchCameraSelected(res[0], false, false);
      }
    }
  }


  const style = css`
    color: var(--light-300);

    .traffic-cam-header {
      display: flex;
      margin: 2rem;

      .traffic-cam-img {
        margin-right: 8px;
        img {
          width: 50px;
          height: auto;
        }
      }
    }
  }
    `;

  return (
    <div css={style}>

      {!showCameraDetails ?
        <div>
          <div className='traffic-cam-header'>
            <div className='traffic-cam-img'><img src={cameraImage} alt={formatMessage("_widgetLabel")} /></div>
            <div className='explain'>{formatMessage("explain")}</div>
          </div>

          <Autocomplete
            placeholder={formatMessage("autocompletePlaceholder")}
            value={searchValue}
            onChange={setSearchValue}
            queryFunction={descriptionQueryFunction}
            onItemSelect={searchCameraSelected}
            displayField="Description"
            maxResultToShow={10}
            searchIcon={true}
          />
        </div>
        :
        <TraficCameraDetails cameraObj={selectedObj} map={currentJimuMapView} formatMessage={formatMessage} goBack={goBack} />
      }
      {mapWidgetId &&
        <JimuMapViewComponent
          useMapWidgetId={mapWidgetId}
          onActiveViewChange={handleActiveViewChange}
        />
      }
    </div>
  )
}

export default Widget;