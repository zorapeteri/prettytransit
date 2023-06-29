import type { Feature, LineString } from 'geojson'
import * as PIXI from 'pixi.js'

export type PixiApp = PIXI.Application<PIXI.ICanvas>
export type PixiContainer = PIXI.Container<PIXI.DisplayObject>
export type PixiTexture = PIXI.Texture

export type TransportTypes = Record<string, TransportType>

export type TransportType = {
  name: string
  colors: {
    bg: string
    fg: string
  }
}

export type Line = {
  colors: { bg: string; fg: string }
  route_ids: string[]
  transportType: string
  origin: string
  destination: string
  tracks: Pick<Track, 'origin' | 'destination' | 'id' | 'stops' | 'lineString'>[]
}

export type LinesCollection = Record<string, Line>

export type Route = {
  id: string
  name: string
  transportType: string
  colors: {
    bg: string
    fg: string
  }
}

export type Stop = {
  id: string
  name: string
  onTrackLocation: number
  coordIndex: number
  distanceToNextStop: number
}

export const daysOfTheWeek = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
] as const

export type DayOfTheWeek = (typeof daysOfTheWeek)[number]

export type Track = {
  id: string
  route: Route
  origin: string
  destination: string
  stops: Stop[]
  timeline: number[]
  duration: number
  timetable: Partial<Record<DayOfTheWeek, number[]>>
  lineString: Feature<LineString>
  length: number
  uniquePath?: boolean
}
