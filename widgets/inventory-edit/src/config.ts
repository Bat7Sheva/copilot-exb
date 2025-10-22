import {
  type ImmutableObject,
  type IMUseDataSource,
  type ImmutableArray,
  type IMFieldSchema
} from 'jimu-core'

export enum EditModeType {
  Attribute = 'ATTRIBUTE',
  Geometry = 'GEOMETRY'
}

export enum LayerHonorModeType {
  Webmap = 'WEBMAP',
  Custom = 'CUSTOM'
}

export enum SparkChangedType {
  Added = 'Added',
  Updated = 'Updated',
  Deleted = 'Deleted'
}

export enum ImportHintType {
  NoMap = 'NOMAP',
  NoLayer = 'NOEDITABLE'
}

export enum SnapSettingMode {
  Prescriptive = 'PRESCRIPTIVE',
  Flexible = 'FLEXIBLE'
}

export interface TreeFields extends IMFieldSchema {
  children?: TreeFields[]
  groupKey?: number
  editAuthority?: boolean
  subDescription?: string
  editable?: boolean
}

export interface LayersConfig {
  id: string
  name: string
  layerId?: string
  useDataSource: IMUseDataSource
  addRecords?: boolean
  deleteRecords?: boolean
  updateRecords?: boolean
  updateAttributes?: boolean
  updateGeometries?: boolean
  featureSnapping?: boolean
  showFields: IMFieldSchema[]
  groupedFields: TreeFields[]
  layerHonorMode: LayerHonorModeType
  layerEditingEnabled?: boolean
  isTable?: boolean
}

export interface Config {
  layersConfig?: ImmutableArray<LayersConfig>
  editMode: EditModeType
  selfSnapping?: boolean
  featureSnapping?: boolean
  defaultSelfEnabled?: boolean
  defaultFeatureEnabled?: boolean
  defaultSnapLayers?: string[]
  description: string
  noDataMessage: string
  snapSettingMode: SnapSettingMode
  uploadFileUrl?: string; // geonet
  upLoadPath?: string; // geonet
}

export type IMConfig = ImmutableObject<Config>
