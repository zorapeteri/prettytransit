import colors from '@/constants/colors'
import getProjection from './getProjection'
import { geoProject } from 'd3-geo-projection'
import * as PIXI from 'pixi.js'
import drawCoords from './drawCoords'
import type { PixiApp } from '@/types'

async function drawCity(city: string, pixi: PixiApp) {
  const { projection, cityFeatureCollection } = await getProjection(city)
  const cityProjection = geoProject(cityFeatureCollection.features[0], projection).geometry
    .coordinates
  return new Promise<void>((resolve) => {
    let line: PIXI.Graphics
    const drawCityTickerFn = () => {
      if (line) {
        pixi.ticker.remove(drawCityTickerFn)
        resolve()
      }
      line = new PIXI.Graphics()
      line.lineStyle(1, colors.lightGray.hex)
      drawCoords(cityProjection as [number, number][], line)
      pixi.stage.addChild(line)
    }

    pixi.ticker.add(drawCityTickerFn)
  })
}

export default drawCity
