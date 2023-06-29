import * as PIXI from 'pixi.js'

const coordsToPoints = (coords: number[][]) =>
  coords.map((coord) => new PIXI.Point(coord[0], coord[1]))
export default coordsToPoints
