import { daysOfTheWeek, type PixiApp, type Track } from '@/types'
import { startOfDay, getDay, addDays, isBefore, isAfter } from 'date-fns'
import * as PIXI from 'pixi.js'
import pointAlong from './pointAlong'
import { getTextureForColor } from './colorTexturesCache'
import { getTrackDotColor } from './getTrackDotColor'

const dwellTime = 30_000
const hourInMilliseconds = 3_600_000
const dotSizeInPixels = 30

function log(time: number, track: Track, status: TickerStatus, stopIndex?: number) {
  let action
  switch (status) {
    case TickerStatus.DwellingAtDestination:
    case TickerStatus.DwellingAtStop:
      action = 'dwelling at'
      break
    default:
      action = 'going to'
      break
  }
  console.log(
    `${new Date(time).toLocaleTimeString()} - ${track.route.name} towards ${
      track.destination
    } is ${action} ${track.stops[stopIndex || 0].name} (stop ${(stopIndex || 0) + 1}/${
      track.stops.length
    })`
  )
}

enum TickerStatus {
  WaitingForDeparture,
  EnRoute,
  DwellingAtStop,
  DwellingAtDestination
}

export function setupTripsForTimeFrame(
  pixi: PixiApp,
  tracks: Track[],
  currentTime: number,
  fromUnix: number,
  toUnix: number
) {
  const fromDay = daysOfTheWeek[getDay(fromUnix)]
  const toDay = daysOfTheWeek[getDay(toUnix)]
  const fromDayStart = startOfDay(fromUnix).getTime()
  const toDayStart = startOfDay(toUnix).getTime()
  const tracksWithDepartures = tracks
    .filter((track) => track.timetable[fromDay] || track.timetable[toDay])
    .map((track) => {
      const departures = []
      if (track.timetable[fromDay]) {
        const fromDayTimetable = track.timetable[fromDay]!
        const fromDayDeparturesInTimeFrame = fromDayTimetable
          .map((millisecondsAfterMidnight) => {
            const timestamp = fromDayStart + millisecondsAfterMidnight
            if (timestamp >= fromUnix && timestamp <= toUnix) {
              return timestamp
            }
            return false
          })
          .filter(Boolean) as number[]
        departures.push(...fromDayDeparturesInTimeFrame)
      }
      if (fromDay !== toDay && track.timetable[toDay]) {
        const toDayTimetable = track.timetable[toDay]!
        const toDayDeparturesInTimeFrame = toDayTimetable
          .map((millisecondsAfterMidnight) => {
            const timestamp = toDayStart + millisecondsAfterMidnight
            if (timestamp >= fromUnix && timestamp <= toUnix) {
              return timestamp
            }
            return false
          })
          .filter(Boolean) as number[]
        departures.push(...toDayDeparturesInTimeFrame)
      }
      return { ...track, departures }
    })
    .filter((track) => track.departures.length)
  const dotOffset = Math.round((dotSizeInPixels * window.dotScale) / 2)
  tracksWithDepartures.forEach((track) => {
    const { timeline } = track
    const container = window.lineContainers[track.route.name]
    track.departures.forEach((departure) => {
      const timeUntilDeparture = departure - currentTime
      let elapsed = 0.0
      let status: TickerStatus = TickerStatus.WaitingForDeparture
      let stopIndex = 0
      let dot: PIXI.Sprite
      let rate = 0
      let timeToNextStop = 0

      const drawLine = () => {
        const point = pointAlong(track.id, stopIndex, rate)
        dot.x = point[0] - dotOffset
        dot.y = point[1] - dotOffset
      }

      const nextStop = () => {
        stopIndex++
        timeToNextStop = timeline[stopIndex] - timeline[stopIndex - 1] - dwellTime
      }

      const fin = () => {
        if (dot) {
          dot.destroy()
          container.removeChild(dot)
        }
        pixi.ticker.remove(departureTickerFn)
      }

      const departureTickerFn = (delta: number) => {
        elapsed += (delta / 60) * 1000

        if (!container.visible) {
          fin()
          return
        }

        if (status === TickerStatus.WaitingForDeparture) {
          if (elapsed >= timeUntilDeparture) {
            elapsed = 0
            status = TickerStatus.DwellingAtStop
            nextStop()
            const point = pointAlong(track.id, stopIndex, rate)
            dot = new PIXI.Sprite(getTextureForColor(getTrackDotColor(track), 'circle'))
            dot.x = point[0] - dotOffset
            dot.y = point[1] - dotOffset
            dot.scale.set(window.dotScale)
            container.addChild(dot)
          } else {
            return
          }
        }

        if (status === TickerStatus.EnRoute && elapsed < timeToNextStop) {
          rate = elapsed / timeToNextStop
          drawLine()
        }

        if (status === TickerStatus.EnRoute && elapsed >= timeToNextStop) {
          elapsed = 0
          status =
            stopIndex === timeline.length - 1
              ? TickerStatus.DwellingAtDestination
              : TickerStatus.DwellingAtStop
          if (status === TickerStatus.DwellingAtStop) {
            nextStop()
          }
        }

        if (status === TickerStatus.DwellingAtStop && elapsed >= dwellTime) {
          elapsed = 0
          rate = 0
          status = TickerStatus.EnRoute
        }

        if (status === TickerStatus.DwellingAtDestination && elapsed >= dwellTime) {
          fin()
          return
        }
      }

      pixi.ticker.add(departureTickerFn)
    })
  })
}

export function setupDepartingTripsEveryHour(
  pixi: PixiApp,
  tracks: () => Track[],
  currentTime: () => number
) {
  let elapsed = 0.0
  pixi.ticker.add((delta: number) => {
    if (elapsed === 0) {
      const time = currentTime()
      setupTripsForTimeFrame(pixi, tracks(), time, time, time + hourInMilliseconds)
    }

    elapsed += (delta / 60) * 1000

    if (elapsed >= hourInMilliseconds) {
      elapsed = 0
    }
  })
}

// msam = milliseconds after midnight
function msamToUnix(msam: number, midnightUnix: number) {
  return midnightUnix + msam
}

function endOfTripUnix(track: Track, msam: number, midnightUnix: number) {
  return msamToUnix(msam, midnightUnix) + track.duration + dwellTime
}

type OngoingTrip = { stopIndex: number; status: TickerStatus; elapsed: number }
type TrackWithOngoingTrips = Track & { ongoingTrips: OngoingTrip[] }

function getOngoingTrips(tracks: Track[], currentTime: number): TrackWithOngoingTrips[] {
  // yesterday and today
  const tracksWithOngoingTrips = []
  for (let dayOffset = -1; dayOffset <= 0; dayOffset++) {
    const offsetDate = addDays(currentTime, dayOffset)
    const day = daysOfTheWeek[getDay(offsetDate)]
    const midnightUnix = startOfDay(offsetDate).getTime()
    for (const track of tracks) {
      const ongoingTrips: OngoingTrip[] = []
      if (track.timetable[day]) {
        track.timetable[day]?.forEach((msam) => {
          const departureUnix = msamToUnix(msam, midnightUnix)
          const endOfTrip = endOfTripUnix(track, msam, midnightUnix)
          if (isBefore(endOfTrip, currentTime) || isAfter(departureUnix, currentTime)) {
            return
          }

          const msSinceDeparture = currentTime - departureUnix

          if (msSinceDeparture >= track.duration) {
            ongoingTrips.push({
              stopIndex: track.stops.length - 1,
              status: TickerStatus.DwellingAtDestination,
              elapsed: msSinceDeparture - track.duration
            })
            return
          }

          const stopIndex = track.timeline.findIndex((stamp) => msSinceDeparture <= stamp)
          if (stopIndex <= 0) {
            throw new Error(`ongoing trip is somehow not ongoing, stopIndex is ${stopIndex}`)
          }

          let elapsed = msSinceDeparture - track.timeline[stopIndex - 1]

          if (elapsed < dwellTime) {
            ongoingTrips.push({
              stopIndex,
              status: TickerStatus.DwellingAtStop,
              elapsed
            })
            return
          }

          elapsed -= dwellTime

          ongoingTrips.push({
            stopIndex,
            status: TickerStatus.EnRoute,
            elapsed
          })
        })
        if (ongoingTrips.length) {
          tracksWithOngoingTrips.push({ ...track, ongoingTrips })
        }
      }
    }
  }
  return tracksWithOngoingTrips
}

export function setupOngoingTrips(pixi: PixiApp, tracks: Track[], currentTime: number) {
  const tracksWithOngoingTrips = getOngoingTrips(tracks, currentTime)
  const dotOffset = Math.round((dotSizeInPixels * window.dotScale) / 2)
  for (const track of tracksWithOngoingTrips) {
    const { timeline } = track
    const container = window.lineContainers[track.route.name]
    for (const trip of track.ongoingTrips) {
      let elapsed = trip.elapsed
      let status: TickerStatus = trip.status
      let stopIndex = trip.stopIndex
      let timeToNextStop = timeline[stopIndex] - timeline[stopIndex - 1] - dwellTime
      let rate = 0
      const point = pointAlong(track.id, stopIndex, rate)
      const dot = new PIXI.Sprite(getTextureForColor(getTrackDotColor(track), 'circle'))
      dot.x = point[0] - dotOffset
      dot.y = point[1] - dotOffset
      dot.scale.set(window.dotScale)
      container.addChild(dot)

      const fin = () => {
        if (dot) {
          dot.destroy()
          container.removeChild(dot)
        }
        pixi.ticker.remove(departureTickerFn)
      }

      const drawLine = () => {
        const point = pointAlong(track.id, stopIndex, rate)
        dot.x = point[0] - dotOffset
        dot.y = point[1] - dotOffset
      }

      const nextStop = () => {
        stopIndex++
        timeToNextStop =
          timeline[stopIndex] - timeline[stopIndex - 1] - (stopIndex === 1 ? 0 : dwellTime)
      }

      const departureTickerFn = (delta: number) => {
        elapsed += (delta / 60) * 1000

        if (!container.visible) {
          fin()
          return
        }

        if (status === TickerStatus.EnRoute && elapsed < timeToNextStop) {
          rate = elapsed / timeToNextStop
          drawLine()
        }

        if (status === TickerStatus.EnRoute && elapsed >= timeToNextStop) {
          elapsed = 0
          status =
            stopIndex === timeline.length - 1
              ? TickerStatus.DwellingAtDestination
              : TickerStatus.DwellingAtStop
          if (status === TickerStatus.DwellingAtStop) {
            nextStop()
          }
        }

        if (status === TickerStatus.DwellingAtStop && elapsed >= dwellTime) {
          elapsed = 0
          rate = 0
          status = TickerStatus.EnRoute
          drawLine()
        }

        if (status === TickerStatus.DwellingAtDestination && elapsed >= dwellTime) {
          fin()
          return
        }
      }

      pixi.ticker.add(departureTickerFn)
    }
  }
}
