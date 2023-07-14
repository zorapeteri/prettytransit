import type cities from './cities'
import type countries from './countries'

export const cityCountries: Record<(typeof cities)[number], (typeof countries)[number]> = {
  berlin: 'germany',
  budapest: 'hungary',
  potsdam: 'germany',
  szombathely: 'hungary',
  zalaegerszeg: 'hungary',
  siofok: 'hungary',
  sopron: 'hungary',
  gyor: 'hungary',
  keszthely: 'hungary',
  pecs: 'hungary',
  miskolc: 'hungary',
  vienna: 'austria',
  // london: 'uk',
  brighton: 'uk',
  dublin: 'ireland',
  bratislava: 'slovakia',
  belgrade: 'serbia'
}
