
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
  selectCompaniesLoaded,
  selectCompaniesStatus,
  selectCompaniesTotal,
} from './store/companiesSlice.js'

const PAGE_LIMIT = 10

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
const countryNameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
})

function getCountryName(countryCode) {
  const country = countries[countryCode]
  return country ? countryNames.of(country.code) : countryCode
}

const headers = [
  { name: 'company', label: 'Company', sortable: true },
  { name: 'contact', label: 'Contact', sortable: true },
  {
    name: 'country',
    label: 'Country',
    sortable: true,
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
  const hasLoaded = useSelector(selectCompaniesLoaded)
  const total = useSelector(selectCompaniesTotal)
  const [searchText, setSearchText] = useState('')
  const [sort, setSort] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const requestOptions = useMemo(
    () => ({
      filter: searchText,
      sortCol: sort?.column,
      sortKey: sort?.direction,
      limit: PAGE_LIMIT,
    }),
    [searchText, sort],
  )

  const visibleData = useMemo(() => {
    if (sort?.column !== 'country') {
      return data
    }

    return [...data].sort((first, second) => {
      const comparison = countryNameCollator.compare(
        getCountryName(first.country),
        getCountryName(second.country),
      )
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sort])

  useEffect(() => {
    dispatch(fetchCompanies({ ...requestOptions, page: currentPage }))
  }, [currentPage, dispatch, requestOptions])

  const handlePageChange = (page) => {
    if (status !== 'loading' && page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSearchTextChange = (value) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const handleSortChange = (updateSort) => {
    setSort(updateSort)
    setCurrentPage(1)
  }

  const retryCurrentPage = () => {
    dispatch(fetchCompanies({ ...requestOptions, page: currentPage }))
  }

  if (!hasLoaded && status !== 'failed') {
    return <p className="p-8 text-slate-600" role="status">Loading companies...</p>
  }

  return (
    <Table
      headers={headers}
      data={visibleData}
      searchText={searchText}
      onSearchTextChange={handleSearchTextChange}
      sort={sort}
      onSortChange={handleSortChange}
      isLoading={status === 'loading'}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onRetry={retryCurrentPage}
    />
  )
}

export default App
