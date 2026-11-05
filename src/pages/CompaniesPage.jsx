import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Table from '../components/Table.jsx'
import {
  fetchCompanies,
  selectCompaniesData,
  selectCompaniesError,
  selectCompaniesLoaded,
  selectCompaniesPage,
  selectCompaniesStatus,
  selectCompaniesTotal,
} from '../store/companiesSlice.js'
import {
  countries,
  countryNameCollator,
  getCountryName,
} from '../utils/countries.js'

const PAGE_LIMIT = 100

const headers = [
  { name: 'id', label: 'ID' },
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
          {getCountryName(item.country)}
        </span>
      )
    },
  },
  {
    name: 'logo',
    label: 'Logo',
    render: (item) =>
      typeof item.logo === 'string' && item.logo.trim() ? (
        <img
          src={item.logo}
          alt={`${item.company} logo`}
          className="h-12 w-12 object-contain"
          loading="lazy"
        />
      ) : (
        '-'
      ),
  },
]

function CompaniesPage() {
  const dispatch = useDispatch()
  const data = useSelector(selectCompaniesData)
  const status = useSelector(selectCompaniesStatus)
  const error = useSelector(selectCompaniesError)
  const hasLoaded = useSelector(selectCompaniesLoaded)
  const page = useSelector(selectCompaniesPage)
  const total = useSelector(selectCompaniesTotal)
  const [searchText, setSearchText] = useState('')
  const [sort, setSort] = useState(null)

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
    dispatch(fetchCompanies({ ...requestOptions, page: 1 }))
  }, [dispatch, requestOptions])

  const loadMore = useCallback(() => {
    if (status !== 'loading' && data.length < total) {
      dispatch(fetchCompanies({ ...requestOptions, page: page + 1 }))
    }
  }, [data.length, dispatch, page, requestOptions, status, total])

  if (!hasLoaded && status !== 'failed') {
    return <p className="p-8 text-slate-600" role="status">Loading companies...</p>
  }

  if (!hasLoaded && error) {
    return <p className="p-8 text-red-700" role="alert">{error}</p>
  }

  return (
    <Table
      headers={headers}
      data={visibleData}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      sort={sort}
      onSortChange={setSort}
      hasMore={data.length < total}
      isLoading={status === 'loading'}
      error={error}
      onLoadMore={loadMore}
    />
  )
}

export default CompaniesPage
