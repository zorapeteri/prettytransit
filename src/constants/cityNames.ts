import type cities from './cities'

export const cityNames: Record<(typeof cities)[number], string> = {
  berlin: 'Berlin',
  budapest: 'Budapest',
  potsdam: 'Potsdam',
  szombathely: 'Szombathely',
  zalaegerszeg: 'Zalaegerszeg',
  siofok: 'Siófok',
  sopron: 'Sopron',
  vienna: 'Vienna',
  // london: 'London',
  brighton: 'Brighton and Hove',
  dublin: 'Dublin',
  bratislava: 'Bratislava',
  belgrade: 'Belgrade'
}
