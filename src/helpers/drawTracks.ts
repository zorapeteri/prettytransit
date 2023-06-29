import type { PixiApp, PixiContainer, Track } from '@/types'
import * as PIXI from 'pixi.js'
import colors from '@/constants/colors'
import drawCoords from './drawCoords'

let container: PixiContainer

export function drawTrack(
  trackId: string,
  color?: string,
  width?: number,
  _container?: PixiContainer
) {
  const coords = window.trackProjections[trackId]
  const line = new PIXI.Graphics()
  line.lineStyle(width || 1, color || colors.lightGray.hex)
  drawCoords(coords, line)
  ;(_container || container).addChild(line)
  return line
}

export function drawTracks(tracks: Track[], pixi: PixiApp) {
  return new Promise<void>((resolve) => {
    if (!pixi.stage.children.includes(container)) {
      container = new PIXI.Container()
      pixi.stage.addChild(container)
    } else {
      while (container.children[0]) {
        container.removeChild(container.children[0])
      }
    }
    let trackIndex = 0
    const drawTracksTickerFn = () => {
      drawTrack(tracks[trackIndex].id)
      if (trackIndex === tracks.length - 1) {
        pixi.ticker.remove(drawTracksTickerFn)
        resolve?.()
      } else {
        trackIndex++
      }
    }

    pixi.ticker.add(drawTracksTickerFn)
  })
}
