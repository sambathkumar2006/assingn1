
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AT, CA, DE, GB, IT, MX } from 'country-flag-icons/react/3x2'
import Table from './components/Table.jsx'
import {
  fetchCompanies,
  selectCompaniesData,
  selectCompaniesError,
  selectCompaniesStatus,
} from './store/companiesSlice.js'

const countryFlags = {
  Austria: AT,
  Canada: CA,
  Germany: DE,
  Italy: IT,
  Mexico: MX,
  UK: GB,
}

const headers = [
  { name: 'company', label: 'Company' },
  { name: 'contact', label: 'Contact' },
  {
    name: 'country',
    label: 'Country',
    render: (item) => {
      const Flag = countryFlags[item.country]

      return (
        <span className="inline-flex items-center gap-2">
          {Flag && (
            <Flag
              title={`${item.country} flag`}
              className="h-4 w-6 rounded-sm"
            />
          )}
          {item.country}
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
  const [sort, setSort] = useState({
    column: headers[0].name,
    direction: 'desc',
  })

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
      .sort((first, second) => {
        const comparison = String(first[sort.column] ?? '').localeCompare(
          String(second[sort.column] ?? ''),
          undefined,
          { numeric: true, sensitivity: 'base' },
        )

        return sort.direction === 'asc' ? comparison : -comparison
      })
  }, [data, searchText, sort])

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
      sort={sort}
      onSortChange={setSort}
    />
  )
}

export default App
