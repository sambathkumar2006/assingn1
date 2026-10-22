
import { useEffect, useState } from 'react'
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

  return <Table headers={headers} data={data} />
}

export default App
