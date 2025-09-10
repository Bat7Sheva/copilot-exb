/** @jsx jsx */
import { React, jsx, css, uuidv1, DataSourceTypes, loadArcGISJSAPIModule, getAppStore, defaultMessages as jimuCoreMessages, hooks, polished } from 'jimu-core'
import { Loading, LoadingType, Input, Label, Icon, Button } from 'jimu-ui'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import defaultMessages from '../../translations/default'
import { PngFileDetails, type DataOptions, type FeatureCollection, type LayerInFeatureCollection } from '../../types' // geonet PngFileDetails
import { getNextAddedDataId, isIOSDevice, preventDefault } from '../../utils'
import { useTheme } from 'jimu-theme'
import { IMConfig } from '../../../config' // geonet
import { MapViewManager } from 'jimu-arcgis'; // geonet

export interface DataFileUploadProps {
  widgetId: string
  portalUrl: string
  multiDataOptions: DataOptions[]
  nextOrder: number
  onChange: (multiDataOptions: DataOptions[]) => void
  setErrorMsg: (msg: string) => void,
  config: IMConfig // geonet
}

interface FileInfo {
  id: string
  name: string
  type: SupportedFileTypes
  data: FormData
  size: number //bytes
}

enum SupportedFileTypes {
  CSV = 'csv',
  GeoJson = 'geojson',
  Shapefile = 'shapefile',
  KML = 'kml',
  GPX = 'gpx',
  DWG = 'dwg' // geonet
}

const MaxFileSize: { [key in SupportedFileTypes]: number /** bytes */ } = {
  [SupportedFileTypes.CSV]: 10485760,
  [SupportedFileTypes.GeoJson]: 10485760,
  [SupportedFileTypes.Shapefile]: 2097152,
  // KML size limitaion: https://doc.arcgis.com/en/arcgis-online/reference/kml.htm
  [SupportedFileTypes.KML]: 10485760,
  [SupportedFileTypes.GPX]: 10485760,
  [SupportedFileTypes.DWG]: 25000000//16240000// geonet
}

// value is translate key
enum UploadFileError {
  NotSupportedType = 'notSupportedFileTypeError',
  FailedToUpload = 'failedToUploadError',
  ExceedMaxSize = 'exceedMaxSizeError',
  ExceedMaxRecords = 'exceedMaxRecordsError',
  NotAllowedCharInFileName = 'notAllowedCharInFileNameError'
}

const { useState, useEffect, useMemo, useRef } = React

const INPUT_ACCEPT = isIOSDevice() ? undefined : Object.values(SupportedFileTypes).map(t => getFileExtension(t)).join(',')

export const DataFileUpload = (props: DataFileUploadProps) => {
  const { onChange, setErrorMsg, nextOrder, portalUrl, widgetId, multiDataOptions, config } = props // geonet config
  const translate = hooks.useTranslation(jimuCoreMessages, defaultMessages)
  const dragToUploadBtnId = useMemo(() => `${widgetId}-drag-to-upload`, [widgetId])
  const clickToUploadBtnId = useMemo(() => `${widgetId}-click-to-upload`, [widgetId])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const uploadingFileInfo = useRef<FileInfo>(null)
  const toRemoveFilesInfo = useRef<FileInfo[]>([])

  const viewManager = MapViewManager.getInstance(); //geonet
  const mapView = viewManager.getJimuMapViewById(viewManager.getAllJimuMapViewIds()[0]); //geonet
  const [wkid, setWkid] = useState(null); //geonet

  useEffect(() => {
    onChange(multiDataOptions)
  }, [multiDataOptions, onChange])

  //geonet
  useEffect(() => {
    setWkid(mapView.view.spatialReference.wkid);
  }, [wkid])

  const uploadRef = useRef()

  const onFileChange = async (e) => {
    if (!e.target.files) {
      return
    }

    try {
      setIsLoading(true)


      const file: File = e.target.files[0]
      const fileInfo = getFileInfo(file)
      uploadingFileInfo.current = fileInfo

      if (!fileInfo.type) {
        throw new Error(UploadFileError.NotSupportedType)
      }

      if (fileInfo.size > MaxFileSize[fileInfo.type]) {
        throw new Error(UploadFileError.ExceedMaxSize)
      }

      // geonet
      const regex = new RegExp("[;:><$/\*%!@#&=~+']")
      if (regex.test(fileInfo.name)) {
        throw new Error(UploadFileError.NotAllowedCharInFileName)
      }

      const newPngFile: PngFileDetails = { //geonet
        filePath: null
      };

      let cleanfile: File
      let cleanFileInfo;

      if (fileInfo.type != SupportedFileTypes.DWG) { //geonet
        const myFileId = createFileId();
        const fileBase64 = await convertToBase64(file);

        const cleanFile = await uploadFile(myFileId, fileBase64, fileInfo)
        let newFileFrom64 = await base64ToFile(cleanFile, fileInfo.name, fileInfo.type)
        cleanfile = newFileFrom64//e.target.files[0]
        cleanFileInfo = getFileInfo(cleanfile)
        uploadingFileInfo.current = cleanFileInfo
      }

      if (fileInfo.type === SupportedFileTypes.DWG) { //geonet
        const myFileId = createFileId();
        const fileBase64 = await convertToBase64(file);
        if ((fileBase64.length) > MaxFileSize.dwg) {
          throw new Error(UploadFileError.ExceedMaxSize)
        }

        await uploadAndGetPng(myFileId, fileBase64, fileInfo, newPngFile);
        cleanfile = file;
        cleanFileInfo = getFileInfo(cleanfile)
        uploadingFileInfo.current = cleanFileInfo
      }

      //const featureCollection = await generateFeatureCollection(fileInfo, portalUrl, wkid)
      const featureCollection = await generateFeatureCollection(cleanFileInfo, portalUrl, wkid)

      // Break the process if uploading of the file is canceled.
      if (toRemoveFilesInfo.current.some(f => f.id === cleanFileInfo.id)) { // geonet fileInfo => cleanFileInfo
        toRemoveFilesInfo.current = toRemoveFilesInfo.current.filter(f => f.id !== cleanFileInfo.id) // geonet fileInfo => cleanFileInfo
        return
      }

      if (featureCollection?.layers?.length > 0 && cleanFileInfo.type != SupportedFileTypes.DWG) { //geonet
        onChange(multiDataOptions.concat(featureCollection.layers.map((l: LayerInFeatureCollection, i) => ({
          dataSourceJson: {
            id: getNextAddedDataId(widgetId, nextOrder + i),
            type: DataSourceTypes.FeatureLayer,
            sourceLabel: l.layerDefinition?.name || (i === 0 ? cleanFileInfo.name : `${cleanFileInfo.name} ${i}`) // geonet fileInfo => cleanFileInfo
          },
          order: nextOrder + i,
          restLayer: l,
          pngFileDetails: newPngFile // geonet
        }))))
      } else { // geonet
        onChange(multiDataOptions.concat({
          dataSourceJson: {

            id: getNextAddedDataId(widgetId, nextOrder + 1),
            type: DataSourceTypes.SimpleLocal,//'DWG',
            sourceLabel: cleanFileInfo.name //// geonet fileInfo => cleanFileInfo
          },
          order: nextOrder + 1,
          restLayer: null,
          pngFileDetails: newPngFile
        }))
      }


    } catch (err) {
      // Show warning.
      if (err.message === UploadFileError.NotSupportedType) {
        setErrorMsg(translate(UploadFileError.NotSupportedType, { fileName: uploadingFileInfo.current?.name }))
      } else if (err.message === UploadFileError.ExceedMaxSize || err.details?.messages?.[0]?.includes('max size')) { // File exceeds the max size allowed of 10MB.
        setErrorMsg(translate(UploadFileError.ExceedMaxSize))
      } else if (err.message === UploadFileError.ExceedMaxRecords || err.message?.includes('maximum number')) { // The maximum number of records allowed (1000) has been exceeded.
        setErrorMsg(translate(UploadFileError.ExceedMaxRecords))
      } else if (err.message === UploadFileError.NotAllowedCharInFileName) { //geonet
        setErrorMsg(translate(UploadFileError.NotAllowedCharInFileName))

      } else if (err.message != "" && translate(UploadFileError.FailedToUpload, { fileName: uploadingFileInfo.current?.name }) != err.message) { // geonet
        //setErrorMsg(translate(err))
        setErrorMsg(translate(UploadFileError.FailedToUpload, { fileName: uploadingFileInfo.current?.name }) + " " + err.message) // geonet

      } else {
        setErrorMsg(translate(UploadFileError.FailedToUpload, { fileName: uploadingFileInfo.current?.name }))
      }
    } finally {
      setIsLoading(false)
      uploadingFileInfo.current = null
      // Clear value to allow to upload the same file again.
      e.target.value = null

      if (uploadRef.current) {
        (uploadRef.current as HTMLInputElement).focus()
      }
    }
  }

  const onFileRemove = () => {
    toRemoveFilesInfo.current.push(uploadingFileInfo.current)
    uploadingFileInfo.current = null
    setIsLoading(false)
  }

  //geonet start

  function base64ToFile(base64: string, fileName: string, type: string): Promise<File> {
    let mimeType = "";
    if (type.toLowerCase() == "geojson") { mimeType = "application/octet-stream" }
    else if (type.toLowerCase() == "kml") { mimeType = "application/octet-stream" }
    else if (type.toLowerCase() == "csv") { mimeType = "text/csv" }
    else if (type.toLowerCase() == "shapefile") { mimeType = "application/x-zip-compressed" }

    let fileNameWthiType = "";
    if (type.toLowerCase() == "shapefile") { fileNameWthiType = fileName } else { fileNameWthiType = fileName + "." + type }

    return new Promise((resolve, reject) => {
      //const [header, base64Data] = base64.split(',');
      //let header = type
      //const mimeType = type//header.match(/data:(.*);base64/)?.[1];

      if (!mimeType || !base64) {
        throw new Error('Invalid Base64 format');
      }

      // Decode Base64 string
      const binaryString = atob(base64);
      const byteNumbers = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        byteNumbers[i] = binaryString.charCodeAt(i);
      }

      // Create a Blob from the byte array
      const blob = new Blob([byteNumbers], { type: mimeType });

      // Convert Blob to File
      const file = new File([blob], fileNameWthiType, { type: mimeType });
      resolve(file);
    });

  }

  async function uploadFile(myFileId: string, fileBase64: any, fileInfo: FileInfo) {
    const UploadOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileDataUrl: fileBase64,
        fileName: myFileId,
        fileContentType: fileInfo.type
      })
    };

    try {
      const response = await fetch(config.GeonetApi.baseUrl + config.GeonetApi.uploadFile, UploadOptions);

      if (!response.ok) {
        throw new Error(UploadFileError.FailedToUpload);
      }
      const res = await response.json();

      if (res.isOk == false && res.error != null && res.error != "") {
        throw new Error(res.error);
      } else if (res.isOk == true && res.error != null && res.error != "") {
        throw new Error(res.error);
      }
      else if (res.isOk == true && (res.error == "" || res.error == null)) {
        return res.file64
      }

    } catch (err) {
      throw new Error(err);
    }
  }



  async function uploadAndGetPng(myFileId: string, fileBase64: any, fileInfo: FileInfo, pngFile: PngFileDetails) {
    const pngUploadOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileDataUrl: fileBase64,
        fileName: myFileId,
        fileContentType: fileInfo.type
      })
    };

    try {
      const response = await fetch(config.GeonetApi.baseUrl + config.GeonetApi.uploadDwg, pngUploadOptions);

      if (!response.ok) {
        throw new Error(UploadFileError.FailedToUpload);
      }
      const res = await response.json();

      if (res.isOk == false && res.error != null && res.error != "") {
        throw new Error(res.error);
      } else if (res.isOk == true && res.error != null && res.error != "") {
        throw new Error(res.error);
      }
      else if (res.isOk == true && (res.error == "" || res.error == null)) {
        setPngPath(res.filePath, pngFile);
      }

      setIsLoading(false);
      return pngFile;

    } catch (err) {
      throw new Error(err);
    }
  }

  function setPngPath(path, pngFile: PngFileDetails) {
    pngFile.filePath = path;
  }

  function createFileId() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  function convertToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data = reader.result;
        resolve(base64data);
      }
      reader.onerror = reject;
    });
  }
  //geonet end
  const [uploadInputFocused, setUploadInputFocused] = useState(false)
  const theme = useTheme()

  return <div className='data-file-upload w-100 h-100 pb-4 pt-6 px-4' css={style}>
    {/* geonet start */}
    {/* <div className='supported-type-icons d-flex justify-content-around align-items-center px-6 mb-4'>
      <Icon width={13} height={16} icon={require('../../assets/file.svg')} />
      <Icon width={24} height={24} icon={require('../../assets/file1.svg')} />
      <Icon width={32} height={32} icon={require('../../assets/file2.svg')} />
      <Icon width={24} height={24} icon={require('../../assets/file3.svg')} />
      <Icon width={13} height={16} icon={require('../../assets/file.svg')} />
    </div> */}

    {/* <div className='supported-types'>{translate('supportedTypesHint')}</div> */}
    {/* geonet end */}

    
    <div className='drag-area-container'>{/* geonet (mt-4) */}
      <Label for={dragToUploadBtnId} className='drag-area text-center'>
        <div className='font-14'>{translate('dropOrBrowseToUpload')}</div>
        <div className='upload-btn-container w-75' title={translate('upload')}>
          <Label for={clickToUploadBtnId} className='upload-btn text-center mt-3 mb-0 text-truncate' css={uploadInputFocused ? css`outline: ${polished.rem(2)} solid ${theme.colors.palette.primary[700]}` : ''}>{/* geonet (replace mt-4 to mt-3) */}
            <PlusOutlined size={15} className='mr-2' />
            <span>{translate('upload')}</span>
          </Label>
          <Input id={clickToUploadBtnId} title='' className='upload-btn-file-input' type='file' accept={INPUT_ACCEPT} onChange={onFileChange} tabIndex={isLoading ? -1 : 0} ref={uploadRef}
            onFocus={() => { setUploadInputFocused(true) }} onBlur={() => { setUploadInputFocused(false) }} />
        </div>
    {/* geonet start */}
        <div className='supported-types mt-4 mb-2 d-flex justify-content-center'> <div className='i-icon'>i</div>{translate('supportedTypesHint')}</div>
        <div className='d-flex align-items-center supported-types-hint'>
          {translate('supportedTypes').split(",").map((type) => {
            return (<div className='supported-type d-flex align-items-center'>{type}</div>)
          })}
        </div>
    {/* geonet end */}

      </Label>
      <Input id={dragToUploadBtnId} onClick={preventDefault} title='' className='drag-area-file-input' type='file' accept={INPUT_ACCEPT} onChange={onFileChange} tabIndex={-1} />

    </div>

    {
      isLoading &&
      <div className='upload-loading-container' title={translate('fileIsUploading', { fileName: uploadingFileInfo.current?.name })}>
        <div className='upload-loading-content'>
          <Loading className='upload-loading' type={LoadingType.Primary} width={30} height={28} />
          <div className='upload-loading-file-name d-flex justify-content-center align-items-center'>
            <div className='w-100 font-14 text-center'>{uploadingFileInfo.current == null ? "" : /*geonet condition*/
              translate('fileIsUploading', { fileName: <div className='w-100 multiple-lines-truncate font-16'>{uploadingFileInfo.current?.name}</div> })}
            </div>
          </div>
          {uploadingFileInfo.current != null &&  /*geonet condition*/
            <div className='upload-loading-btn d-flex justify-content-center'>
              <Button type='danger' onClick={onFileRemove}>{translate('cancel')}</Button>
            </div>
          }</div>
      </div>
    }

  </div>
}

function getFileInfo(file: File): FileInfo {
  const type = getFileType(file.name)
  const name = file.name.replace(`.${type}`, '')
  const data = new FormData()
  data.set('file', file)
  data.set('filetype', type)
  data.set('f', 'json')
  return {
    id: uuidv1(),
    type,
    name,
    data,
    size: file.size
  }
}

function readFileAsText(fileInfo: FileInfo) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      resolve(event.target.result)
    }
    reader.readAsText(fileInfo.data.get('file') as File)
  })
}

function getKmlServiceUrl() {
  const isPortal = getAppStore().getState()?.portalSelf?.isPortal
  if (isPortal) {
    const portalUrl = getAppStore().getState()?.portalUrl
    return `${portalUrl}/sharing/kml`
  }
  const env = window.jimuConfig.hostEnv
  const envHost = env === 'dev' ? 'devext' : env === 'qa' ? 'qa' : ''
  return `https://utility${envHost}.arcgis.com/sharing/kml`
}

async function generateFeatureCollection(fileInfo: FileInfo, portalUrl: string, wkid: string): Promise<FeatureCollection> {
  const esriRequest: typeof __esri.request = await loadArcGISJSAPIModule('esri/request')

  if (fileInfo.type === SupportedFileTypes.KML) {
    const serviceUrl = getKmlServiceUrl()
    const kmlString = await readFileAsText(fileInfo)
    const res = await esriRequest(serviceUrl, {
      query: {
        kmlString: encodeURIComponent(kmlString),
        model: 'simple',
        folders: ''
        // outSR: JSON.stringify(outSpatialReference)
      },
      responseType: 'json'
    })
    return res?.data?.featureCollection as FeatureCollection
  }
  if (fileInfo.type === SupportedFileTypes.DWG) { // geonet
    return null;
  }

  let publishParameters = {}

  // GPX file does not need publishParameters
  if (fileInfo.type !== SupportedFileTypes.GPX) {
    // 1. Use REST API analyze to get `publishParameters` which is needed in REST API generate.
    const analyzeUrl = `${portalUrl}/sharing/rest/content/features/analyze`
    fileInfo.data.set('analyzeParameters', JSON.stringify({
      enableGlobalGeocoding: true,
      sourceLocale: getAppStore().getState().appContext?.locale ?? 'en' // TODO: use org geocode service
    }))
    const analyzeResponse = await esriRequest(analyzeUrl, {
      body: fileInfo.data,
      method: 'post'
    })
    fileInfo.data.delete('analyzeParameters')
    publishParameters = analyzeResponse?.data?.publishParameters
    //geonet
    publishParameters.targetSR.wkid = wkid;
    publishParameters.targetSR.latestWkid = wkid;
    if (publishParameters.type.toLowerCase() == 'csv') {
      publishParameters.sourceSR.wkid = wkid
      publishParameters.sourceSR.latestWkid = wkid
    }
  }

  // 2. Use REST API generate to get features from the uploaded file.
  const generateUrl = `${portalUrl}/sharing/rest/content/features/generate`
  fileInfo.data.set('publishParameters', JSON.stringify({
    ...publishParameters,
    name: fileInfo.name
  }))
  const generateResponse = await esriRequest(generateUrl, {
    body: fileInfo.data,
    method: 'post'
  })
  fileInfo.data.delete('publishParameters')

  if (generateResponse?.data?.featureCollection) {
    (generateResponse?.data?.featureCollection as FeatureCollection)?.layers?.forEach((ly) => {
      ly.featureSet?.features?.forEach((feature) => {
        ly.layerDefinition?.fields?.forEach((field) => {
          const attrValue = feature.attributes?.[field.name]
          if (field.type === 'esriFieldTypeSmallInteger') {
            if (typeof attrValue === 'boolean') {
              feature.attributes[field.name] = attrValue ? 1 : 0
              return
            }
            if (typeof attrValue !== 'number') {
              feature.attributes[field.name] = null
            }
          }
        })
      })
    })
  }

  return generateResponse?.data?.featureCollection as FeatureCollection
}

function getFileType(name: string): SupportedFileTypes {
  return Object.values(SupportedFileTypes).find(t => name.toUpperCase()?.endsWith(getFileExtension(t).toUpperCase()))
}

function getFileExtension(supportedFileType: SupportedFileTypes): string {
  return supportedFileType === 'shapefile' ? '.zip' : `.${supportedFileType}`
}

const style = css`
  position: relative;
  color: var(--secondary-100) !important; // geonet replace from var(--dark-500)

  .font-14 {
    font-size: 14px;
  }

  .font-16 {
    font-size: 16px;
    font-weight: 500;
  }

  .upload-loading-container {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: var(--white);
    background-color: var(--primary-600); // geonet
    z-index: 2;
  }
  .upload-loading-content {
    position: absolute;
    top: 0;
    bottom: 60px;
    right: 0;
    left: 0;
  }
  .upload-loading-file-name {
    position: absolute;
    width: 200px;
    height: 100px;
    right: calc(50% - 100px);
    top: 80px;
    word-break: break-all;
    overflow: hidden;
  }
  .upload-loading-btn {
    position: absolute;
    width: 200px;
    height: 32px;
    right: calc(50% - 100px);
    top: calc(50% + 80px);
    button.btn-danger {
      background-color: var(--danger-500);
      border: 0;
      border-radius: 5px; // geonet
    }
  }

  .supported-types {
    font-size: 13px;
  }

  .drag-area-container {
    width: 100%;
    height: 250px; // geonet replace from 280px
  }

  .drag-area {
    // border: 1px dashed var(--light-400); // geonet
    // geonet start
    border: 1px solid var(--secondary-900);
    background-color: var(--primary);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    // geonet start
    padding-top: 30%; // geonet replace from 50%
    width: 100%;
    height: 100%;
    user-select: none;
  }
  .upload-btn {
    border: 1px solid var(--light-400);
    color: var(--dark-800);
    background-color: var(--white);
    border-radius: 2px;
    line-height: 28px;
    padding-left: 16px;
    padding-right: 16px;
    height: 30px;
    user-select: none;
    max-width: 100%;
  }
  .upload-btn-container:hover {
    .upload-btn {
      background-color: var(--light-200) !important;
    }
  }
  .drag-area-container, .upload-btn-container {
    position: relative;
    display: inline-block;
    z-index: 1;
  }
  .upload-btn-file-input, .drag-area-file-input {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
  }
  .upload-btn-file-input {
    cursor: pointer;
  }

  // geonet start
  .supported-types-hint {
    justify-content: space-evenly;
  }

  .supported-type {
    // border: 1px solid red;
    border-radius: 8px;
    background-color: var(--primary-500);
    height: 3vh;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  }

  .i-icon {
    background-color: var(--secondary-100);
    color: var(--dark-500);
    width: 20px;
    hight: 20px;
    border-radius: 7px;
    margin-right: 5px;
  }
  // geonet end

`
