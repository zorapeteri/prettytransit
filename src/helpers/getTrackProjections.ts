import type { Track } from '@/types'
import getProjection from './getProjection'
import { geoProject } from 'd3-geo-projection'
import { distance } from './lineSliceAlong'
import pick from 'lodash.pick'

export async function getTrackProjections(city: string, tracks: Track[]) {
  const { projection } = await getProjection(city)
  const trackProjections: typeof window.trackProjections = tracks.reduce((acc, track) => {
    return {
      ...acc,
      [track.id]: geoProject(track.lineString, projection).geometry.coordinates
    }
  }, {})
  window.trackProjections = trackProjections
  window.trackLengths = Object.keys(trackProjections).reduce((acc, trackId) => {
    let length = 0
    const coords = trackProjections[trackId]

    for (let i = 0; i < coords.length - 1; i++) {
      length += distance(coords[i], coords[i + 1])
    }
    return {
      ...acc,
      [trackId]: length
    }
  }, {})
  window.trackStopPositions = tracks.reduce((acc, track) => {
    return {
      ...acc,
      [track.id]: track.stops.map((stop) =>
        pick(stop, 'onTrackLocation', 'coordIndex', 'distanceToNextStop')
      )
    }
  }, {})
}
