
import { useEffect, useMemo, useState } from 'react'
import Table from './components/Table.jsx'

const headers = [
  { name: 'company', label: 'Company' },
  { name: 'contact', label: 'Contact' },
  { name: 'country', label: 'Country' },
]

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
    async function fetchCompanies() {
      try {
        const response = await fetch('/companies.json')
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        setData(await response.json())
      } catch (error) {
        console.error('Failed to fetch company data:', error)
        setError('Unable to load company data.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>{error}</p>
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
