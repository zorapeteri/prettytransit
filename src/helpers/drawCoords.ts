import * as PIXI from 'pixi.js'

export default function drawCoords(coords: [number, number][], context: PIXI.Graphics) {
  coords.forEach((point, i) => (i === 0 ? context.moveTo(...point) : context.lineTo(...point)))
}
