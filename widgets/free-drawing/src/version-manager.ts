import { BaseVersionManager } from 'jimu-core'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.12.0',
    description: 'support decimal places in measurements #13051',
    upgrader: (oldConfig) => {
      // inline
      oldConfig = oldConfig.setIn(['measurementsInfo'], {
        decimalPlaces: {
          point: 5,
          line: 3,
          area: 3
        }
      })

      return oldConfig
    }
  }]
}

export const versionManager = new VersionManager()
