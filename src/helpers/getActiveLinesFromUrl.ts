import type { LinesCollection } from '@/types'
import { groupLinesByType } from './groupLinesByType'
import { isBusPrimary } from './isBusPrimary'

function getActiveLinesFromUrl(transportTypes: readonly string[], lines: LinesCollection) {
  const split = location.pathname.split('/').filter(Boolean)
  if (split.length < 2) {
    return {
      activeLinesFromUrl: [transportTypes[0]],
      usedTypes: [transportTypes[0]],
      unusedTypes: transportTypes.filter((type) => type !== transportTypes[0])
    }
  }
  const linesFromUrl = split[split.length - 1].split(',')
  const lineNames = Object.keys(lines)
  const linesGroupedByType = groupLinesByType(transportTypes, lines)
  let validLines = linesFromUrl
    .map((line) => {
      if (transportTypes.includes(line.toLowerCase())) {
        return line.toLowerCase()
      }
      if (line.includes(':')) {
        const split = line.split(':')
        if (split.length > 2) return false
        const [lineName, transportType] = split
        const adjustedLineName = `${lineName.toUpperCase()}:${transportType.toLowerCase()}`
        if (lineNames.includes(adjustedLineName)) {
          return adjustedLineName
        }
      }
      if (lineNames.includes(line.toUpperCase())) {
        return line.toUpperCase()
      }
      return false
    })
    .filter(Boolean)
    .filter((line) => {
      if (!isBusPrimary(transportTypes) && line === 'bus') {
        // alert is fine because you have to mess with the URL to get here
        alert(
          'There are too many bus lines to be displayed all at once. Please select bus lines individually.'
        )
        return false
      }
      return true
    }) as string[]
  if (validLines.length < 1) {
    return {
      activeLinesFromUrl: [transportTypes[0]],
      usedTypes: [transportTypes[0]],
      unusedTypes: transportTypes.filter((type) => type !== transportTypes[0])
    }
  }

  Object.entries(linesGroupedByType).forEach(([type, _lines]) => {
    const _lineNames = Object.keys(_lines)
    if (
      _lineNames.length < 10 &&
      _lineNames.filter((line) => validLines.includes(line)).length == _lineNames.length
    ) {
      // validLines contains all lines for type, we can just say 'type'
      validLines = [type, ...validLines.filter((line) => !_lineNames.includes(line))]
    }
  })

  return {
    activeLinesFromUrl: validLines,
    usedTypes: transportTypes.filter((type) =>
      validLines.some((line) => line === type || lines[line]?.transportType === type)
    ),
    unusedTypes: transportTypes.filter((type) =>
      validLines.some((line) => !(line === type || lines[line]?.transportType === type))
    )
  }
}

export default getActiveLinesFromUrl
