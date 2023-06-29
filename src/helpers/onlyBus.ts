import type { TransportTypes } from '@/types'

export function onlyBus(transportTypes: TransportTypes | readonly string[]) {
  if (Array.isArray(transportTypes)) {
    return transportTypes.length === 1 && transportTypes[0] === 'bus'
  }
  return Object.keys(transportTypes).length === 1 && (transportTypes as TransportTypes).bus
}
