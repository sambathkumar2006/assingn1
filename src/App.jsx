import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CompaniesPage from './pages/CompaniesPage.jsx'
import AddCompanyPage from './pages/AddCompanyPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CompaniesPage />} />
        <Route path="/add-company" element={<AddCompanyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
