import { BaseVersionManager } from 'jimu-core'
import { LayerHonorModeType } from './config'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.6.0',
    description: 'Add editable to table fields.',
    upgrader: (oldConfig, id) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        const newTableFields = config.tableFields.map(field => {
          return {
            ...field,
            editAuthority: true
          }
        })
        newConfig = newConfig.setIn(['layersConfig', i, 'tableFields'], newTableFields)
      })
      return newConfig
    }
  }, {
    version: '1.10.0',
    description: 'Add visible to table fields.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        const newTableFields = config.tableFields.map(field => {
          return {
            ...field,
            visible: true
          }
        })
        newConfig = newConfig.setIn(['layersConfig', i, 'tableFields'], newTableFields)
      })
      return newConfig
    }
  }, {
    version: '1.12.0',
    description: 'Add header setting options.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        const defaultHeaderFontSetting = {
          backgroundColor: '',
          fontSize: 14,
          bold: false,
          color: ''
        }
        config = config.set('headerFontSetting', defaultHeaderFontSetting)
        newConfig = newConfig.setIn(['layersConfig', i], config)
      })
      return newConfig
    }
  }, {
    version: '1.13.0',
    description: 'Add "showCount" and "updateText" options.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        config = config.set('showCount', false).set('updateText', true)
        newConfig = newConfig.setIn(['layersConfig', i], config)
        // searchFields update
        if (config?.searchFields && typeof (config?.searchFields) === 'string') {
          const newSearchFields = config.searchFields.split(',') || []
          newConfig = newConfig.setIn(['layersConfig', i, 'searchFields'], newSearchFields)
        } else if (!config?.searchFields) {
          newConfig = newConfig.setIn(['layersConfig', i, 'searchFields'], [])
        }
      })
      return newConfig
    }
  }, {
    version: '1.14.0',
    description: 'Update honor webmap options',
    upgrader: async (oldConfig) => {
      let newConfig = oldConfig
      const newLayersConfig = newConfig.layersConfig.map(config => {
        return {
          ...config,
          layerHonorMode: LayerHonorModeType.Custom
        }
      })
      newConfig = newConfig.setIn(['layersConfig'], newLayersConfig)
      return newConfig
    }
  }]
}

export const versionManager = new VersionManager()
