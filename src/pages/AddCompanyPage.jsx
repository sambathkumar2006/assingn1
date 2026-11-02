import { Link } from 'react-router-dom'
import AddCompanyForm from '../components/AddCompanyForm.jsx'

function AddCompanyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* 3D Atmospheric Background Spheres for Depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/25 via-indigo-300/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-bl from-purple-300/20 via-sky-300/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-300/20 to-transparent blur-3xl"
      />

      <main className="relative mx-auto w-full max-w-3xl">
        {/* Navigation & Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="badge-3d">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Company Registration
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Add New Company
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Register a new organization and contact into the directory.
            </p>
          </div>

          <Link
            to="/"
            className="btn-3d-secondary self-start sm:self-auto gap-2 px-4 py-2 text-sm"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Companies
          </Link>
        </div>

        {/* 3D Form Card */}
        <AddCompanyForm />
      </main>
    </div>
  )
}

export default AddCompanyPage
