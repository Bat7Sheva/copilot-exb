import { React, hooks, defaultMessages as jimuCoreMessages, defaultMessages, DataActionManager, DataSourceTypes} from 'jimu-core'
import {Checkbox, Slider, Tooltip} from 'jimu-ui'
import { useEffect, useState } from 'react';
import { MapViewManager } from 'jimu-arcgis';
import ImageElement from 'esri/layers/support/ImageElement'
import MediaLayer from 'esri/layers/MediaLayer'
import ControlPointsGeoreference from 'esri/layers/support/ControlPointsGeoreference'
import FeatureLayer from 'esri/layers/FeatureLayer';
import SpatialReference from 'esri/geometry/SpatialReference'
import Point from 'esri/geometry/Point'
import { DataLevel } from 'jimu-core' //geonet for DataAction

export const AddDataToMap = (props) => {   
    const translate = hooks.useTranslation(jimuCoreMessages, defaultMessages);
    const [isShown, setIsShown] = useState(false);
    const viewManager = MapViewManager.getInstance();
    const mapView = viewManager.getJimuMapViewById(viewManager.getAllJimuMapViewIds()[0]);
    const [jimuMap, setJimuMap] =  useState(null);
    const [opacitiyVal, setOpacitiyVal] = useState(100);

    const [uid, setUId] = useState(null);

    useEffect(()=>{
        props.setId(uid)
    }, [uid])

    useEffect(() => {
        setJimuMap(mapView)
    }, [mapView])

    function checkBoxAction(){
        setIsShown(!isShown)
        if(isShown == false){
            prepareLayersToAdd()
        } else {
            //const lyrToRemove = jimuMap.view.map.layers._items.find(x => x.uid == uid);
            const lyrToRemove = jimuMap.view.map.layers.flatten(function (item) {
                return item["layers"] || item["sublayers"];
            }).find(x => x.uid == uid);

            if (lyrToRemove && lyrToRemove.parent.type && lyrToRemove.parent.type == "group") {
                lyrToRemove.parent.remove(lyrToRemove);
            } else {
                jimuMap.view.map.remove(lyrToRemove);
            }
        }
    }

    function prepareLayersToAdd(){
        if(props.ds.type == DataSourceTypes.SimpleLocal){ // DWG
            //sourcePoint - size of the png in pixels
            //mapPoint need to get extent of the png as coordinate (min-max-x-y)
            
            fetch(props.pngFile.filePath+ ".json")
            .then(response => { response.json()
                .then(data => {
                    const pngUrl = props.pngFile.filePath + ".png";
                    const maxX = data.Xmax;
                    const minX = data.Xmin;
                    const maxY = data.Ymax;
                    const minY = data.Ymin;
                    const pngX = data.PngX;
                    const pngY = data.PngY;
                        
                    const spatialReference = new SpatialReference({ wkid: 2039 });

                    const swCorner = {
                        sourcePoint: { x: 0, y: 0 },
                        mapPoint: new Point({ x:minX, y: maxY, spatialReference })
                    };
                        
                    const nwCorner = {
                        sourcePoint: { x: 0, y: pngY },
                        mapPoint: new Point({ x:  minX, y: minY, spatialReference })
                    };
                        
                    const neCorner = {
                        sourcePoint: { x: pngX, y: pngY },
                        mapPoint: new Point({ x:  maxX, y: minY, spatialReference })
                    };
                        
                    const seCorner = {
                        sourcePoint: { x: pngX, y: 0 },
                        mapPoint: new Point({ x:  maxX, y: maxY, spatialReference })
                    };
                    
                    const controlPoints = [swCorner, nwCorner, neCorner, seCorner];
                    const georeference = new ControlPointsGeoreference({
                        controlPoints, 
                        width: pngX,
                        height: pngY
                    });
                        
                    const imgElement = createImageElement(pngUrl, georeference);
                    const mediaLayer = createMediaLayer(imgElement, spatialReference);
                    mediaLayer.lyrExtent = georeference.coords.extent
                    addLyr(mediaLayer);
                })
            })           
        
        } else if (props.ds.layer && props.ds.layer != null) {
            const currLayer = props.ds.layer
            //currLayer.lyrExtent = currLayer.fullExtent
            addLyr(currLayer);       
        
        } else if(props.ds.url && props.ds.url != null){
            const currLayer = new FeatureLayer({
            url: props.ds.url
         });
         //currLayer.lyrExtent = currLayer.fullExtent
         addLyr(currLayer);
        }
    }

    function createImageElement(url, georeference){
        let currImgElement = new ImageElement({
            image: url,
             georeference
          });
          return currImgElement
    }

    function createMediaLayer(imgElement, spatialRef){
        let mediaLayer = new MediaLayer({
            source: [imgElement],
            title: props.ds.dataSourceJson.label != undefined ? props.ds.dataSourceJson.label : props.ds.dataSourceJson.sourceLabel,
            opacity: 1,
            spatialRef
        });
        return mediaLayer
    }

    function addLyr(lyr){

        //if(isShownOnMap == false){
        setUId(lyr.uid)
            //props.ds.uid = lyr.uid;
            jimuMap.view.map.add(lyr);
            lyr.visible = true
            // if(props.ds.type == DataSourceTypes.SimpleLocal){
            //     jimuMap.view.map.add(lyr, 0)// index=0 to add it below all other layers. jimuMap.view.map.layers._items.length
            // }else{
            //     jimuMap.view.map.add(lyr)
            //}
            zoomToLayer(lyr)
    }

    function zoomToLayer(lyr) {
        if (lyr.lyrExtent && lyr.lyrExtent != null) {
            jimuMap.view.goTo({
                center: lyr.lyrExtent
            })
        }
        else {
            jimuMap.view.goTo({
                center: lyr.fullExtent
            })
		}
        //if(props.ds.type == DataSourceTypes.SimpleLocal){
        //    jimuMap.view.goTo({
        //        center: lyr.source.fullExtent
        //    })
        //}else {
        //    const act = DataActionManager.getInstance().getActions();
        //    const zoomto = act.find(x => x.name.toLocaleLowerCase() == "zoomtofeature");
        //    const p = {
        //        name: "",
        //        dataSource: props.ds,
        //        records: []
        //    }
        //    zoomto.onExecute(props.ds.dataSourceManager.dataSources, DataLevel.DataSource, jimuMap.mapWidgetId)
        //}
    }

    function onChangeSlider(sliderVal){
        //const currLyr = jimuMap.view.map.layers._items.find(x => x.uid == uid);//props.ds.uid);
        const currLyr = jimuMap.view.map.layers.flatten(function (item) {
            return item["layers"] || item["sublayers"];
        }).find(x => x.uid == uid);

        currLyr.opacity = Number(sliderVal.target.value);
        setOpacitiyVal(Math.round(sliderVal.target.value*100));
    }

    return(
        <>
            {jimuMap && isShown==true &&
            <Tooltip title={translate('layerOpacity') + ": " + opacitiyVal}>
            <Slider
                style={{marginLeft: '10px'}}
                aria-label="Small" 
                value={1}
                min={0} 
                max={1} 
                step={0.01}
                onChange={onChangeSlider}/>
            </Tooltip>
            }
            {
            jimuMap &&
            <Tooltip title={ isShown? translate('removeFromMap') : translate('addToMap')}>
                <Checkbox checked={isShown} onChange={checkBoxAction} />
            </Tooltip>
            }
        </>
    )
}