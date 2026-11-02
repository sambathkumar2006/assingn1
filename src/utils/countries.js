import {
  AE,
  AU,
  BR,
  CA,
  CN,
  DE,
  ES,
  FR,
  GB,
  IE,
  IN,
  IT,
  JP,
  KR,
  MX,
  NL,
  SE,
  SG,
  US,
  ZA,
} from 'country-flag-icons/react/3x2'

export const countries = {
  ARE: { code: 'AE', Flag: AE },
  AUS: { code: 'AU', Flag: AU },
  BRA: { code: 'BR', Flag: BR },
  CAN: { code: 'CA', Flag: CA },
  CHN: { code: 'CN', Flag: CN },
  DEU: { code: 'DE', Flag: DE },
  ESP: { code: 'ES', Flag: ES },
  FRA: { code: 'FR', Flag: FR },
  GBR: { code: 'GB', Flag: GB },
  IND: { code: 'IN', Flag: IN },
  IRL: { code: 'IE', Flag: IE },
  ITA: { code: 'IT', Flag: IT },
  JPN: { code: 'JP', Flag: JP },
  KOR: { code: 'KR', Flag: KR },
  MEX: { code: 'MX', Flag: MX },
  NLD: { code: 'NL', Flag: NL },
  SGP: { code: 'SG', Flag: SG },
  SWE: { code: 'SE', Flag: SE },
  USA: { code: 'US', Flag: US },
  ZAF: { code: 'ZA', Flag: ZA },
}

export const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
export const countryNameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
})

export function getCountryName(countryCode) {
  const country = countries[countryCode]
  return country ? countryNames.of(country.code) : countryCode
}

export const countryOptions = Object.keys(countries)
  .map((code) => ({
    code,
    name: getCountryName(code),
  }))
  .sort((a, b) => countryNameCollator.compare(a.name, b.name))

