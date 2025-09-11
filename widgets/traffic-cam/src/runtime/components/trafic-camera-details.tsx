/** @jsx jsx */
import { useEffect } from "react";
import { css, jsx } from "jimu-core";
import { Button } from "jimu-ui";
import { JimuMapView } from "jimu-arcgis";
import { CameraInformation } from "./camera-information";
import { TrafficCameraPlayer } from "./traffic-camera-player";

export const TraficCameraDetails = ({ cameraObj, map, formatMessage, goBack }: { cameraObj: any, map: JimuMapView, formatMessage: (va: string) => string, goBack: () => void }) => {

    const cameraImage = require("../assets/images/CAM.png");

    // useEffect(() => {
    //     if (!cameraObj) return;
    //     console.log('cameraObj', cameraObj);
    // }, [cameraObj])

    const style = css`
        color: var(--light-300);
        margin: 2rem;

        .title {
            display: flex;
        }
        .camera-description {
            font-weight: 550;
        }
        .traffic-cam-header {
            justify-content: space-between;
            margin-left: 5px;
            margin-right: 5px;
        }

        .clear-button {
            background-color: transparent;
            border-radius: 8px;
            color: white;
            padding: 0 4;
            margin: 0;
            height: min-content;
            font-size: 0.95rem;
        }
    `;

    return (
        <div css={style}>
            <div className='traffic-cam-header'>
                <div className="title">
                    <div className='traffic-cam-img'><img src={cameraImage} alt={formatMessage("_widgetLabel")} /></div>
                    <p className="camera-description">{cameraObj.attributes.Description || 'traffic camera'}</p>
                </div>
                <Button className="clear-button" type='default' size='default' onClick={() => { goBack() }} title={formatMessage('goBack')} aria-label={formatMessage('clean')}> {formatMessage('clean')} </Button>
            </div>

            <div className="traffic-camera-video">
                <TrafficCameraPlayer feedUrl={cameraObj.attributes.FeedURL}></TrafficCameraPlayer>
                <CameraInformation formatMessage={formatMessage} cameraObj={cameraObj}></CameraInformation>
            </div>
        </div>
    );
}