/// <reference types="vite/client" />

import type { PixiContainer, PixiTexture, Stop } from '@/types'
import type { FeatureCollection } from 'geojson'

declare global {
  interface Window {
    trackProjections: Record<string, [number, number][]>
    projectionScale: number
    dotScale: number
    projection: d3.GeoProjection
    trackLengths: Record<string, number>
    trackStopPositions: Record<
      string,
      Pick<Stop, 'coordIndex' | 'onTrackLocation' | 'distanceToNextStop'>[]
    >
    textureCache: Record<'square' | 'circle', Record<string, PixiTexture>>
    lineContainers: Record<string, PixiContainer>
    cityFeatureCollection: FeatureCollection
  }
}

export {}
