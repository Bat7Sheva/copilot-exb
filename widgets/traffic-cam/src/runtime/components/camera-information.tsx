/** @jsx jsx */
import { useEffect } from "react";
import { css, jsx } from "jimu-core";


export const CameraInformation = ({
  formatMessage,
  cameraObj,
}: {
  formatMessage: (val: string) => string;
  cameraObj: any;
}) => {

  // useEffect(() => {
  //   if (!cameraObj) return;
  //   console.log("cameraObj", cameraObj);
  // }, [cameraObj]);

  const style = css`
    margin: 2rem;
     .info-container {
      color: white;
      padding: 16px;
      width: 280px;
      font-family: Arial, sans-serif;
      direction: rtl;
      max-width: 100%;
      box-sizing: border-box;
    }
 
    .row {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      margin-bottom: 12px;
    }
 
    .cell {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex: 1;
    }
 
    .label {
      font-size: 14px;
      font-weight: 550;
      color: #ccc;
      margin-bottom: 4px;
    }
 
    .value {
      font-size: 18px;
      font-weight: bold;
    }
 
    .divider {
      border: none;
      height: 1px;
      background-color: #595959;
      margin: 8px 0;
    }
  `;

  return (
    <div css={style}>
      <div className="info-container">
        <div className="row">
          <div className="cell">
            <div className="label">{formatMessage("region")}</div>
            <div className="value">{cameraObj.attributes.Merhav}</div>
          </div>
          <div className="cell">
            <div className="label">{formatMessage("roadNum")}</div>
            <div className="value">{cameraObj.attributes.ROADNUM}</div>
          </div>
        </div>

        <hr className="divider" />

        <div className="row">
          <div className="cell">
            <div className="label">{formatMessage("roadKm")}</div>
            <div className="value">{cameraObj.attributes.FromKM}</div>
          </div>
        </div>
      </div>
    </div>

  );
};