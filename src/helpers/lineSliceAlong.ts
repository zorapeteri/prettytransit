import { radianToPixel, pixelToRadian } from './pixelsRadians'

type Coords = [number, number]

function bearing(coords1: Coords, coords2: Coords) {
  const lon1 = pixelToRadian(coords1[0])
  const lon2 = pixelToRadian(coords2[0])
  const lat1 = pixelToRadian(coords1[1])
  const lat2 = pixelToRadian(coords2[1])
  const a = Math.sin(lon2 - lon1) * Math.cos(lat2)
  const b =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)

  return Math.atan2(a, b)
}

function destination(origin: Coords, distanceInRadians: number, bearingRad: number) {
  const longitude1 = pixelToRadian(origin[0])
  const latitude1 = pixelToRadian(origin[1])

  const latitude2 = Math.asin(
    Math.sin(latitude1) * Math.cos(distanceInRadians) +
      Math.cos(latitude1) * Math.sin(distanceInRadians) * Math.cos(bearingRad)
  )
  const longitude2 =
    longitude1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distanceInRadians) * Math.cos(latitude1),
      Math.cos(distanceInRadians) - Math.sin(latitude1) * Math.sin(latitude2)
    )
  const lng = radianToPixel(longitude2)
  const lat = radianToPixel(latitude2)

  return [lng, lat]
}

export function distance(from: Coords, to: Coords) {
  const dLat = pixelToRadian(to[1] - from[1])
  const dLon = pixelToRadian(to[0] - from[0])
  const lat1 = pixelToRadian(from[1])
  const lat2 = pixelToRadian(to[1])

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2)

  // distance in radians!!
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function lineSliceAlong(trackId: string, startDistPercent: number, stopDistPercent: number) {
  const slice = []
  const coords = window.trackProjections[trackId]
  const origCoordsLength = coords.length
  let travelled = 0
  let overshot, direction, interpolated
  const length = window.trackLengths[trackId]
  const startDist = length * startDistPercent
  const stopDist = length * stopDistPercent
  for (let i = 0; i < coords.length; i++) {
    if (startDist >= travelled && i === coords.length - 1) break
    else if (travelled > startDist && slice.length === 0) {
      overshot = startDist - travelled
      if (!overshot) {
        slice.push(coords[i])
        return slice
      }
      direction = bearing(coords[i], coords[i - 1]) - Math.PI
      interpolated = destination(coords[i], overshot, direction)
      slice.push(interpolated)
    }

    if (travelled >= stopDist) {
      overshot = stopDist - travelled
      if (!overshot) {
        slice.push(coords[i])
        return slice
      }
      direction = bearing(coords[i], coords[i - 1]) - Math.PI
      interpolated = destination(coords[i], overshot, direction)
      slice.push(interpolated)
      return slice
    }

    if (travelled >= startDist) {
      slice.push(coords[i])
    }

    if (i === coords.length - 1) {
      return slice
    }

    travelled += distance(coords[i], coords[i + 1])
  }

  if (travelled < startDist && coords.length === origCoordsLength)
    throw new Error('Start position is beyond line')

  const last = coords[coords.length - 1]
  return [last, last]
}

export default lineSliceAlong
