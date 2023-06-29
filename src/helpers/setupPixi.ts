import * as PIXI from 'pixi.js'
import * as d3 from 'd3'
import debounce from './debounce'
import type { PixiApp } from '@/types'

const width = window.innerWidth
const height = window.innerHeight

function setupPixi(): PixiApp {
  const app: PixiApp = new PIXI.Application({
    width,
    height,
    antialias: true,
    resolution: devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0xffffff,
    resizeTo: window
  })

  document.querySelector('#pixiappcontainer')?.appendChild(app.view as unknown as HTMLElement)

  setupZoom({
    app,
    onEnd: () => {}
  })

  app.stage.position.y = height * 0.05
  app.stage.position.x = 0

  return app
}

function setImmediateInterval(cb: () => void, interval: number) {
  cb()
  return setInterval(cb, interval)
}

export function setupZoom({ onEnd, app }: { onEnd: () => void; app: PixiApp }) {
  let interval: number
  const duration = 200
  function handleZoom(e: any) {
    let elapsed = 0.0
    if (interval) clearInterval(interval)
    const before = {
      k: app.stage.scale.x,
      x: app.stage.position.x,
      y: app.stage.position.y
    }
    const diff = {
      k: before.k - e.transform.k,
      x: before.x - e.transform.x,
      y: before.y - e.transform.y
    }
    interval = setImmediateInterval(() => {
      elapsed += 5

      if (elapsed > duration) {
        clearInterval(interval)
        return
      }

      const easing = d3.easeBackOut(elapsed / duration)

      app.stage.scale.x = before.k - diff.k * easing
      app.stage.scale.y = before.k - diff.k * easing
      app.stage.position.x = before.x - diff.x * easing
      app.stage.position.y = before.y - diff.y * easing
    }, 5)
  }
  const zoom: any = d3
    .zoom()
    .on(
      'zoom',
      debounce((e: any) => handleZoom(e))
    )
    .on('end', onEnd)
  d3.select('#pixiappcontainer').call(zoom)
}

export default setupPixi
