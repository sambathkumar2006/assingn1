import { useEffect, useMemo, useRef } from 'react'
import AddCompanyForm from './AddCompanyForm.jsx'

function CompanyEditDrawer({ company, onClose }) {
  const closeButtonRef = useRef(null)
  const initialValues = useMemo(
    () => ({
      company: company.company ?? '',
      contact: company.contact ?? '',
      country: company.country ?? '',
      email: company.email ?? '',
      logo: typeof company.logo === 'string' && company.logo.trim()
        ? company.logo
        : null,
    }),
    [company],
  )

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus()
      }
    }
  }, [onClose])

  const handleSubmit = (values) => {
    console.log(values)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-company-title"
        className="flex h-full w-full max-w-xl flex-col bg-slate-100 shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="badge-3d mb-2">Company details</p>
            <h2 id="edit-company-title" className="text-xl font-bold text-slate-900">
              Edit company
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close edit company form"
            title="Close"
            className="ml-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <AddCompanyForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </div>
  )
}

export default CompanyEditDrawer
