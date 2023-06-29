import * as PIXI from 'pixi.js'
import type { Line, PixiApp, PixiContainer } from '@/types'
import { drawTrack } from './drawTracks'

let container: PixiContainer

export function drawColoredLineTracks(line: Line, pixi: PixiApp) {
  if (!pixi.stage.children.includes(container)) {
    container = new PIXI.Container()
    pixi.stage.addChild(container)
  }
  const color = line.colors.bg
  line.tracks.forEach((track) => {
    drawTrack(track.id, color, 1.5, container)
  })
  pixi.stage.addChild(container)
  return container
}

export function cleanupColoredLineTracks() {
  while (container?.children[0]) {
    container.removeChild(container.children[0])
  }
}
