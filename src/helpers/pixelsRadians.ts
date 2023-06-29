const earthRadiusInMeters = 6371000

export function pixelToRadian(pixelDistance: number, scale?: number) {
  const metersDistance = pixelDistance / (scale || window.projectionScale)
  const radiansDistance = metersDistance / earthRadiusInMeters
  return radiansDistance
}

export function radianToPixel(radiansDistance: number, scale?: number) {
  const metersDistance = radiansDistance * earthRadiusInMeters
  const pixelDistance = metersDistance * (scale || window.projectionScale)
  return pixelDistance
}
