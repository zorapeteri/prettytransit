import type { LinesCollection } from '@/types'

export function groupLinesByType(transportTypes: readonly string[], lines: LinesCollection) {
  return transportTypes.reduce((acc, type) => {
    return {
      ...acc,
      [type]: Object.fromEntries(
        Object.entries(lines).filter(([_, value]) => {
          return value.transportType === type
        })
      )
    }
  }, {}) as Record<string, LinesCollection>
}
