import type { TransportTypes } from '@/types'

export function isBusPrimary(transportTypes: TransportTypes | readonly string[]) {
  return Array.isArray(transportTypes)
    ? transportTypes[0] === 'bus'
    : Object.keys(transportTypes)[0] === 'bus'
}
