import { Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'

let upgrader = null

describe('Test for version manager', () => {
  beforeAll(() => {
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.12.0'
    })[0]?.upgrader
  })

  it('1. config update for decimalPlaces ,#13051', () => {
    const oldConfig = Immutable({
      isDisplayCanvasLayer: false,
      arrangement: 'Panel',
      drawMode: 'continuous',
      drawingTools: [
        'point',
        'polyline',
        'polygon',
        'rectangle',
        'circle'
      ],
      measurementsInfo: {
        enableMeasurements: false,
        fontsColor: [0, 0, 0, 1],
        fontsSize: 12,
        haloColor: [255, 255, 255, 1],
        haloSize: 2/*,
        decimalPlaces: {
          point: 5,
          line: 3,
          area: 3
        }*/
      },
      measurementsUnitsInfos: [],
      drawingElevationMode3D: 'on-the-ground'
    })

    const newConfig = upgrader(oldConfig)

    expect(newConfig.measurementsInfo.decimalPlaces).toStrictEqual({
      point: 5,
      line: 3,
      area: 3
    })
  })
})
