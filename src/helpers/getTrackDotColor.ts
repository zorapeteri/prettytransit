import type { Track } from '@/types'

export function getTrackDotColor(track: Track) {
  return track.route.colors.bg === '#FFFFFF' ? track.route.colors.fg : track.route.colors.bg
}
