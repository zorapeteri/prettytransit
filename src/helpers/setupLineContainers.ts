import * as PIXI from 'pixi.js'
import type { LinesCollection, PixiApp } from '@/types'

function setupLineContainers(pixi: PixiApp, lines: LinesCollection) {
  window.lineContainers = {}
  Object.keys(lines).forEach((line) => {
    const container = new PIXI.Container()
    window.lineContainers[line] = container
    pixi.stage.addChild(container)
  })
}

export default setupLineContainers
