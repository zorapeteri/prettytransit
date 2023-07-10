import type { TransportTypes } from '@/types'
import _ from 'lodash'

export function onlyBus(transportTypes: TransportTypes | readonly string[]) {
  return (
    _.isEqual(transportTypes, ['bus']) ||
    _.isEqual(transportTypes, ['bus', 'longdistancebus']) ||
    _.isEqual(Object.keys(transportTypes), ['bus']) ||
    _.isEqual(Object.keys(transportTypes), ['bus', 'longdistancebus'])
  )
}
