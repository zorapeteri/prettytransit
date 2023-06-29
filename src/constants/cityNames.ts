import type cities from './cities'

export const cityNames: Record<(typeof cities)[number], string> = {
  berlin: 'Berlin',
  budapest: 'Budapest',
  potsdam: 'Potsdam',
  szombathely: 'Szombathely',
  vienna: 'Vienna',
  london: 'London',
  brighton: 'Brighton and Hove'
}
