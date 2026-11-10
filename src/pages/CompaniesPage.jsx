import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CompanyEditDrawer from '../components/CompanyEditDrawer.jsx'
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
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [sort, setSort] = useState(null)
  const [editingCompany, setEditingCompany] = useState(null)
  const activeRequestRef = useRef(null)
  const closeEditDrawer = useCallback(() => setEditingCompany(null), [])

  useEffect(() => {
    if (searchText === debouncedSearchText) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [debouncedSearchText, searchText])

  const requestOptions = useMemo(
    () => ({
      filter: debouncedSearchText,
      sortCol: sort?.column,
      sortKey: sort?.direction,
      limit: PAGE_LIMIT,
    }),
    [debouncedSearchText, sort],
  )

  const requestCompanies = useCallback(
    (options) => {
      activeRequestRef.current?.abort()
      activeRequestRef.current = dispatch(fetchCompanies(options))
    },
    [dispatch],
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
    requestCompanies({ ...requestOptions, page: 1 })
  }, [requestCompanies, requestOptions])

  useEffect(
    () => () => activeRequestRef.current?.abort(),
    [],
  )

  const loadMore = useCallback(() => {
    if (status !== 'loading' && data.length < total) {
      requestCompanies({ ...requestOptions, page: page + 1 })
    }
  }, [data.length, page, requestCompanies, requestOptions, status, total])

  if (!hasLoaded && status !== 'failed') {
    return <p className="p-8 text-slate-600" role="status">Loading companies...</p>
  }

  if (!hasLoaded && error) {
    return <p className="p-8 text-red-700" role="alert">{error}</p>
  }

  return (
    <>
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
        onEdit={setEditingCompany}
      />
      {editingCompany && (
        <CompanyEditDrawer
          key={editingCompany.id}
          company={editingCompany}
          onClose={closeEditDrawer}
        />
      )}
    </>
  )
}

export default CompaniesPage
