
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import Table from './components/Table.jsx'
import {
  fetchCompanies,
  selectCompaniesData,
  selectCompaniesError,
  selectCompaniesStatus,
} from './store/companiesSlice.js'

const countries = {
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

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })

const headers = [
  { name: 'company', label: 'Company', sortable: true },
  { name: 'contact', label: 'Contact', sortable: true },
  {
    name: 'country',
    label: 'Country',
    render: (item) => {
      const country = countries[item.country]
      const Flag = country?.Flag

      return (
        <span className="inline-flex items-center gap-2">
          {Flag && (
            <Flag
              title={`${item.country} flag`}
              className="h-4 w-6 rounded-sm"
            />
          )}
          {country ? countryNames.of(country.code) : item.country}
        </span>
      )
    },
  },
]

function App() {

  const dispatch = useDispatch()
  const data = useSelector(selectCompaniesData)
  const status = useSelector(selectCompaniesStatus)
  const error = useSelector(selectCompaniesError)
  const [searchText, setSearchText] = useState('')

  const visibleData = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase()

    return data
      .filter((item) =>
        headers.some((header) =>
          String(item[header.name] ?? '')
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        ),
      )
  }, [data, searchText])

  useEffect(() => {
    dispatch(fetchCompanies())
  }, [dispatch])

  if (status === 'idle' || status === 'loading') {
    return <p className="p-8 text-slate-600" role="status">Loading companies...</p>
  }

  if (error) {
    return <p className="p-8 text-red-700" role="alert">{error}</p>
  }

  return (
    <Table
      headers={headers}
      data={visibleData}
      searchText={searchText}
      onSearchTextChange={setSearchText}
    />
  )
}

export default App
