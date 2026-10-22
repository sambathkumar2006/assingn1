
import Table from './components/Table.jsx'

const headers = [
  { name: 'company', label: 'Company' },
  { name: 'contact', label: 'Contact' },
  { name: 'country', label: 'Country' },
]

const companies = [
  {
    company: 'Alfreds Futterkiste',
    contact: 'Maria Anders',
    country: 'Germany',
  },
  {
    company: 'Centro comercial Moctezuma',
    contact: 'Francisco Chang',
    country: 'Mexico',
  },
  {
    company: 'Ernst Handel',
    contact: 'Roland Mendel',
    country: 'Austria',
  },
  {
    company: 'Island Trading',
    contact: 'Helen Bennett',
    country: 'UK',
  },
  {
    company: 'Laughing Bacchus Winecellars',
    contact: 'Yoshi Tannamuri',
    country: 'Canada',
  },
  {
    company: 'Magazzini Alimentari Riuniti',
    contact: 'Giovanni Rovelli',
    country: 'Italy',
  },
]

function App() {
  return <Table headers={headers} data={companies} />
}

export default App
